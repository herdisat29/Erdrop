'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function predictColumnMapping(headers: string[]) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: 'GEMINI_API_KEY is not configured' }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const prompt = `
      You are an expert data analyst. 
      The user uploaded a CSV file of their airdrop farming tracking spreadsheet.
      The CSV has the following headers:
      ${JSON.stringify(headers)}

      Our system expects the following standard fields:
      - name: The name of the project or token
      - chain: The blockchain network
      - status: The progress or status of the farm (e.g. Not Started, In Progress, Eligible, Claimed)
      - estimated_reward: Expected money, points, or allocation
      - website: The URL, link, or website to the project

      Analyze the user's headers and map them to our standard fields. 
      If a user's header doesn't match any of our standard fields, leave it out.
      If none of the user's headers seem to match a standard field, set the value to null.
      Return ONLY a raw JSON object mapping our standard fields to the user's header string exactly as provided.
      Do not wrap in markdown \`\`\`json.
      
      Example output format:
      {
        "name": "Project Title",
        "chain": "Network",
        "status": "Farm Status",
        "estimated_reward": "Expected $",
        "website": "Link"
      }
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Clean up potential markdown JSON wrappers
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()

    let mapping
    try {
      mapping = JSON.parse(cleanedText)
    } catch (e) {
      console.error('Failed to parse Gemini mapping response:', responseText)
      return { error: 'AI returned invalid format' }
    }

    return { data: mapping }
  } catch (error: any) {
    console.error('Column Mapping AI Error:', error)
    return { error: error.message || 'Failed to predict mapping' }
  }
}
