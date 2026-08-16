import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

const projectId = process.env.GOOGLE_CLOUD_PROJECT || "";
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS!, "base64").toString(
    "utf-8",
  ),
);
const client = new RecaptchaEnterpriseServiceClient({ credentials });

async function recaptcha(token: string, action: string): Promise<boolean> {
  if (!token || !action) return false;

  try {
    const [assessment] = await client.createAssessment({
      parent: client.projectPath(projectId),
      assessment: {
        event: {
          token,
          siteKey,
          expectedAction: action,
        },
      },
    });

    const tokenProps = assessment.tokenProperties;
    const score = assessment.riskAnalysis?.score ?? 0;

    if (!tokenProps?.valid || tokenProps.action !== action) {
      return false;
    }

    return score >= 0.5;
  } catch (err) {
    console.error("Failed to validate captcha:", err);
    return false;
  }
}

export { recaptcha };
