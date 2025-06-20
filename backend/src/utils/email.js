const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set your SendGrid API key in your environment variables

exports.sendActivationEmail = async (to, activationToken) => {
  const activationUrl = `http://localhost:3000/activate-account?token=${activationToken}`;
  const msg = {
    to,
    from: 'contact.haider04@gmail.com', // Your verified sender
    subject: 'Activate your CPMS account',
    html: `
      <h2>Welcome to CPMS!</h2>
      <p>Please activate your account by clicking the link below:</p>
      <a href="${activationUrl}">${activationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };
  await sgMail.send(msg);
};

exports.sendJoinRequestNotification = async (to, proposalTitle, groupInfo) => {
  const msg = {
    to,
    from: 'contact.haider04@gmail.com', // Your verified sender
    subject: 'New Join Request for Your Proposal',
    html: `
      <h2>New Join Request</h2>
      <p>A group has requested to join your proposal: <strong>${proposalTitle}</strong>.</p>
      <p>Group Info: ${groupInfo}</p>
      <p>Please review the request in your dashboard.</p>
    `,
  };
  await sgMail.send(msg);
}; 