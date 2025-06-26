import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('SMTP config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? '***' : undefined,
      from: process.env.SMTP_FROM,
    });
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'ImpulsaCol <no-reply@impulsacol.com>',
      to,
      subject: 'Recuperación de contraseña - ImpulsaCol',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Recuperación de contraseña</h2>
          <p>Tu código de recuperación es:</p>
          <div style="font-size: 2rem; font-weight: bold; color: #FFD600; margin: 16px 0;">${code}</div>
          <p>Este código expirará en 15 minutos. Si no solicitaste este cambio, ignora este correo.</p>
          <br/>
          <p>Equipo ImpulsaCol</p>
        </div>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }
} 