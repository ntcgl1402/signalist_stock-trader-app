import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { sendWelcomeEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../action/user.action";

export const sendSignUpEmail = inngest.createFunction(
    {id: "sign-up-email"},
    {event: "app/user.created"},
    async ({event, step}) => {
        const UserProfile = `
            - Country: ${event.data.country}
            - Investment Goals: ${event.data.investmentGoals}
            - Risk Tolerance: ${event.data.riskTolerance}
            - Preferred Industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{UserProfile}}", UserProfile)
        const response = await step.ai.infer('generate-welcome-intro',{
            model: step.ai.models.gemini({model: 'gemini-2.5-flash'}),
            body:{
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {text: prompt}
                        ]
                    }
                ]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || "Welcome to our platform!"

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        });

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    {id: "daily-news-summary"},
    [{event: "app/send.daily.news"}, {cron: '0 12 * * *'} ],
    async ({step}) => {
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)
        if(!users || users.length === 0) {
            return { success: false, message: 'No users to send news summary to' };
        }
    }
)