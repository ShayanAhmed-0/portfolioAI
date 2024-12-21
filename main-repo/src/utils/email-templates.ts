export const send_mail_template = (
  subject: string,
  fullName: string,
  otpKey: string
) => {
  return {
    subject: subject,
    html: `
      <div
        style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
      >
        <img 
              style="
              top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;" 
              src="cid:background" alt="background" 
        />
        <div style="z-index:1; position: relative;">
        <header style="padding-bottom: 20px">
          <div class="logo" style="text-align:center;">
        
          </div>
        </header>
        <main 
          style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
        >
          <h1 
            style="color: #FF3333; font-size: 30px; font-weight: 700;"
          >Welcome To Portfolio AI</h1>
          <p
            style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
          >Hi ${fullName},</p>
          <p 
            style="font-size: 20px; text-align: left; font-weight: 500;"
          >Thank you for registering with us. Please use the following OTP to verify your email address.</p>
          <h2
            style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #097969; text-align: center; margin-top: 20px; margin-bottom: 20px;"
          >${otpKey}</h2>
          <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
          style = "color: #097969; text-decoration: none; border-bottom: 1px solid #097969;" href = "#"
          >let us know.</a></p>
          <p style = "font-size: 20px;">Regards,</p>
          <p style = "font-size: 20px;">Dev Team</p>
        </main>
        </div>
      <div>
      `,
  };
};
