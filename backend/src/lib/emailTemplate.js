export function buildEmailHtml({ preheader = "", heading, bodyHtml, buttonLabel, buttonUrl }) {
  return `<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0; padding:0; background-color:#0b1020; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <span style="display:none; font-size:1px; color:#0b1020; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
      ${preheader}
    </span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1020; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:linear-gradient(180deg, #101a33, #0d1428); border:1px solid rgba(59,130,246,.25); border-radius:18px; overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 0 32px;">
                <div style="display:inline-flex; align-items:center; gap:8px;">
                  <span style="font-size:13px; font-weight:800; letter-spacing:.06em; color:#8fb4ff; text-transform:uppercase;">KovacsFantasy</span>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 32px 8px 32px;">
                <h1 style="margin:0; font-size:22px; line-height:1.3; color:#f5f7fb; font-weight:800;">
                  ${heading}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 32px 4px 32px; font-size:15px; line-height:1.65; color:rgba(245,247,251,.82);">
                ${bodyHtml}
              </td>
            </tr>

            ${
              buttonUrl
                ? `<tr>
              <td style="padding:20px 32px 8px 32px;">
                <a href="${buttonUrl}" style="display:inline-block; background:#2b6cff; color:#ffffff; text-decoration:none; font-weight:800; font-size:14px; padding:12px 22px; border-radius:10px;">
                  ${buttonLabel}
                </a>
              </td>
            </tr>`
                : ""
            }

            <tr>
              <td style="padding:28px 32px 28px 32px; border-top:1px solid rgba(255,255,255,.08); margin-top:20px;">
                <p style="margin:20px 0 0 0; font-size:12px; color:rgba(245,247,251,.45); line-height:1.6;">
                  Ezt az emailt a KovacsFantasy (kovacsfantasy.com) küldte. Ha nem te kezdeményezted ezt a műveletet, nyugodtan hagyd figyelmen kívül ezt az üzenetet.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}