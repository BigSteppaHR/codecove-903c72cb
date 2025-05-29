import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map file extensions to language identifiers for the editor
const extensionToLanguage = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  css: 'css',
  json: 'json',
  md: 'markdown',
  py: 'python',
  go: 'go',
  rs: 'rust',
  java: 'java',
  rb: 'ruby',
  php: 'php',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  swift: 'swift',
  kt: 'kotlin',
  dart: 'dart',
  yml: 'yaml',
  yaml: 'yaml',
  sh: 'shell',
  bash: 'shell',
  txt: 'plaintext',
}

// Create project-type specific system prompts
const getSystemPrompt = (projectType) => {
  const basePrompt = `You are an expert full-stack developer. Generate complete, production-ready code for a ${projectType} application based on the user's prompt.

Requirements:
- Generate a complete project structure with all necessary files
- Use modern best practices and clean, maintainable code
- Include proper error handling and TypeScript types
- Generate working, functional code that can be immediately used

Return your response as a JSON object with this structure:
{
  "files": {
    "/path/to/file.ext": "file content here",
    "/another/file.ext": "more content here"
  }
}

Be comprehensive and include all files needed for a working project. All paths should start with a forward slash.`

  // Add project-type specific instructions
  switch (projectType) {
    case 'web':
      return `${basePrompt}

For web applications:
- Use React 18+ with TypeScript and functional components
- Use Tailwind CSS for styling
- Include proper routing with React Router
- Implement responsive design
- Add proper state management
- Include a package.json with all necessary dependencies
- Start with index.html, App.tsx, and other essential files
- Include a README.md with setup instructions`
    
    case 'mobile':
      return `${basePrompt}

For mobile applications:
- Use React Native with TypeScript and Expo
- Implement responsive layouts that work on various device sizes
- Include navigation using React Navigation
- Add proper state management
- Include a package.json with all necessary dependencies
- Start with App.tsx and other essential files
- Include a README.md with setup instructions`
    
    case 'api':
      return `${basePrompt}

For API endpoints:
- Use Node.js with Express and TypeScript
- Implement proper API structure with routes, controllers, and models
- Include input validation and error handling
- Add authentication middleware if needed
- Include a package.json with all necessary dependencies
- Start with index.ts, routes, and other essential files
- Include a README.md with setup and API documentation`
    
    default:
      return basePrompt
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, projectType = 'web', model = 'claude-4.0' } = await req.json()

    if (!prompt) {
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

    // Get the appropriate system prompt based on project type
    const systemPrompt = getSystemPrompt(projectType)

    // Determine which Claude model to use
    let claudeModel = 'claude-4.0' // Default to Claude 4.0
    
    // If user specified a different model, use that instead
    if (model && model !== 'claude-4.0') {
      // Validate model name to prevent injection
      const validModels = ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-4.0']
      claudeModel = validModels.includes(model) ? model : 'claude-4.0'
    }

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: claudeModel,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Project Type: ${projectType}\nPrompt: ${prompt}\n\nGenerate a complete project based on this description. Return only the JSON with files, no explanations needed.`
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
    
    // Calculate token usage
    const tokensUsed = claudeData.usage?.input_tokens + claudeData.usage?.output_tokens || 1000

    // Parse AI response to extract files
    let filesObject = {}
    
    try {
      // Try to parse the JSON response
      const parsedResponse = JSON.parse(aiResponse)
      
      if (parsedResponse.files && typeof parsedResponse.files === 'object') {
        // Convert the files object to the expected format
        Object.entries(parsedResponse.files).forEach(([path, content]) => {
          // Ensure path starts with a slash
          const normalizedPath = path.startsWith('/') ? path : `/${path}`
          
          // Determine language from file extension
          const extension = normalizedPath.split('.').pop()?.toLowerCase() || ''
          const language = extensionToLanguage[extension] || 'plaintext'
          
          filesObject[normalizedPath] = {
            content: content,
            language: language
          }
        })
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      
      // Fallback: try to extract code blocks from the response
      const codeBlockRegex = /```([\w]+)?\n([\s\S]*?)```/g
      let match
      let fileIndex = 0
      
      while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
        const fileType = match[1] || 'txt'
        const content = match[2]
        const fileName = `/generated-file-${fileIndex}.${fileType}`
        const language = extensionToLanguage[fileType] || 'plaintext'
        
        filesObject[fileName] = {
          content: content,
          language: language
        }
        fileIndex++
      }
      
      if (Object.keys(filesObject).length === 0) {
        // Last resort: create a single file with the entire response
        filesObject['/README.md'] = {
          content: aiResponse,
          language: 'markdown'
        }
      }
    }
    
    // Record token usage in the background
    EdgeRuntime.waitUntil(async () => {
      try {
        await supabase
          .from('token_usage')
          .insert({
            user_id: user.id,
            tokens_consumed: tokensUsed,
            prompt: prompt,
            response_length: aiResponse.length,
            ai_model: claudeModel
          })

        // Update user's token usage
        await supabase.rpc('increment', {
          table_name: 'profiles',
          row_id: user.id,
          column_name: 'tokens_used',
          x: tokensUsed
        })
      } catch (error) {
        console.error('Background token tracking error:', error)
      }
    })

    // Return the files immediately for instant use
    return new Response(
      JSON.stringify({ 
        success: true, 
        files: filesObject,
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
