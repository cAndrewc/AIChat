import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import Groq from 'groq-sdk'; // Import Groq library for interacting with the Groq API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
Welcome to the Headstarter Fitness App! Our mission is to help you achieve your fitness goals through personalized workouts, nutrition plans, and wellness tracking. Here are some key features and guidelines to help you get started:

Features:
Personalized Workout Plans:

Tailored to your fitness level, goals, and preferences.
Includes a mix of cardio, strength training, flexibility exercises, and more.
Video tutorials and step-by-step instructions for each exercise.
Nutrition Guidance:

Customized meal plans based on your dietary preferences and goals.
Nutritional information and healthy recipes.
Calorie and macronutrient tracking.
Progress Tracking:

Monitor your workouts, nutrition, and overall progress.
Set and track fitness goals.
Sync with wearable devices for accurate data.
Community Support:

Join fitness challenges and groups.
Connect with other users for motivation and support.
Share your progress and achievements.
Wellness Tools:

Mindfulness and meditation sessions.
Sleep tracking and tips for better rest.
Stress management techniques.
Guidelines:
Account Setup:

Complete your profile with accurate information for personalized recommendations.
Set your fitness goals (e.g., weight loss, muscle gain, improved endurance).
Safety First:

Always warm up before starting any workout.
Follow the exercise instructions carefully to avoid injury.
Consult with a healthcare provider before starting any new fitness program, especially if you have pre-existing conditions.
Consistency is Key:

Stick to your workout and nutrition plan for the best results.
Track your progress regularly and adjust your plans as needed.
Stay Motivated:

Use the community features to stay engaged.
Celebrate your milestones and achievements.
Don’t hesitate to reach out for support if you need it.
Feedback and Support:

We value your feedback to improve our app. Share your thoughts and suggestions through the app’s feedback feature.
For any technical issues or questions, contact our support team via the app.
User Conduct:
Respect other users and maintain a positive and supportive environment.
Avoid sharing personal information in public forums.
Report any inappropriate behavior or content to our support team.
Get ready to embark on your fitness journey with Headstarter Fitness App! Let's achieve your goals together. 

Only answer questions related to the Headstarter Fitness App. or fitness related exclusively. DO not answer questions related to other apps or topics.
`

// Use your own system prompt here
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // This is the default and can be omitted
});
// POST function to handle incoming requests
export async function POST(req) {

const data = await req.json() // Parse the JSON body of the incoming request

// Create a chat completion request to the OpenAI API
const completion = await groq.chat.completions.create({
  messages: [{ role: "system", content: systemPrompt }, ...data ],
  model: "llama3-8b-8192",
  stream: true, // Enable streaming responses
});

// Create a ReadableStream to handle the streaming response
const stream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
    try {
      // Iterate over the streamed chunks of the response
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
        if (content) {
          const text = encoder.encode(content) // Encode the content to Uint8Array
          controller.enqueue(text) // Enqueue the encoded text to the stream
        }
      }
    } catch (err) {
      controller.error(err) // Handle any errors that occur during streaming
    } finally {
      controller.close() // Close the stream when done
    }
  },
})

return new NextResponse(stream) // Return the stream as the response
}