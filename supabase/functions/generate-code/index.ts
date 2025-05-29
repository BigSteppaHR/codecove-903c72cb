
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, projectId, projectName, projectType } = await req.json()

    if (!prompt || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Claude API key from secrets
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!claudeApiKey) {
      return new Response(
        JSON.stringify({ error: 'Claude API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create system prompt for code generation
    const systemPrompt = `You are an expert full-stack developer. Generate complete, production-ready code for a ${projectType} application based on the user's prompt. 

Requirements:
- Generate a complete project structure with all necessary files
- Use modern best practices and clean, maintainable code
- Include proper error handling and TypeScript types
- For web projects: Use React with TypeScript, Tailwind CSS, and modern hooks
- For mobile projects: Use React Native with TypeScript
- Include package.json with all necessary dependencies
- Generate working, functional code that can be immediately used

Return your response as a JSON object with this structure:
{
  "files": [
    {
      "path": "relative/file/path",
      "content": "file content here",
      "type": "file extension (js, ts, tsx, json, css, etc.)"
    }
  ],
  "tokensUsed": estimated_token_count
}

Be comprehensive and include all files needed for a working project.`

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Project: ${projectName}\nType: ${projectType}\nPrompt: ${prompt}`
          }
        ]
      })
    })

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text()
      console.error('Claude API error:', error)
      return new Response(
        JSON.stringify({ error: 'AI generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const claudeData = await claudeResponse.json()
    const aiResponse = claudeData.content[0].text

    // Parse AI response to extract files
    let generatedFiles
    let tokensUsed = claudeData.usage?.input_tokens + claudeData.usage?.output_tokens || 1000

    try {
      const parsedResponse = JSON.parse(aiResponse)
      generatedFiles = parsedResponse.files || []
      if (parsedResponse.tokensUsed) {
        tokensUsed = parsedResponse.tokensUsed
      }
    } catch (parseError) {
      // Fallback: try to extract code blocks from the response
      generatedFiles = []
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
      let match
      let fileIndex = 0

      while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
        const fileType = match[1] || 'txt'
        const content = match[2]
        const fileName = `generated-file-${fileIndex}.${fileType}`
        
        generatedFiles.push({
          path: fileName,
          content: content,
          type: fileType
        })
        fileIndex++
      }

      if (generatedFiles.length === 0) {
        // Last resort: create a single file with the entire response
        generatedFiles = [{
          path: 'README.md',
          content: aiResponse,
          type: 'md'
        }]
      }
    }

    // Update project status to generating
    await supabase
      .from('projects')
      .update({ 
        status: 'generating',
        last_generated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    // Background task to save files
    EdgeRuntime.waitUntil(async () => {
      try {
        // Clear existing files
        await supabase
          .from('project_files')
          .delete()
          .eq('project_id', projectId)

        // Insert new files
        const filesToInsert = generatedFiles.map((file: any) => ({
          project_id: projectId,
          file_path: file.path,
          content: file.content,
          file_type: file.type
        }))

        await supabase
          .from('project_files')
          .insert(filesToInsert)

        // Update project status to ready
        await supabase
          .from('projects')
          .update({ status: 'ready' })
          .eq('id', projectId)

        // Record token usage
        await supabase
          .from('token_usage')
          .insert({
            user_id: user.id,
            project_id: projectId,
            tokens_consumed: tokensUsed,
            prompt: prompt,
            response_length: aiResponse.length,
            ai_model: 'claude-3.5-sonnet'
          })

        // Update user's token usage
        await supabase.rpc('increment', {
          table_name: 'profiles',
          row_id: user.id,
          column_name: 'tokens_used',
          x: tokensUsed
        })

      } catch (error) {
        console.error('Background task error:', error)
        // Reset status on error
        await supabase
          .from('projects')
          .update({ status: 'draft' })
          .eq('id', projectId)
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Code generation started',
        tokensUsed 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
