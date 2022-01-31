import axios from 'axios';
const { SENDGRID_HOST, SENDGRID_API_KEY } = process.env;

/**
 * this function use dinamic template sendgrid
 * @param to: destination email address
 * @param dynamic_template_data: dinamic data
 * @param template_id: need to get template_id from sendgrid sandbox
 * @return Promise<void>
 */
export async function sendEmail({
  to,
  dynamic_template_data,
  template_id
}: {
  to: string;
  dynamic_template_data: Record<string, unknown>;
  template_id: string;
}): Promise<void> {
  await axios
    .post(
      SENDGRID_HOST,
      {
        personalizations: [
          {
            to: [{ email: to }],
            bcc: [{ email: 'dev@thetreedots.com' }],
            dynamic_template_data: dynamic_template_data
          }
        ],
        from: { email: 'noreply@thetreedots.com', name: 'Treedots' },
        template_id: template_id
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`
        }
      }
    )
    .then((res) => {
      return res.status;
    })
    .catch((err) => {
      console.log('sendgrid:', err?.response?.status || 0, err?.response?.statusText || err);
      return false;
    });
}
