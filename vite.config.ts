import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {sendTicketEmail, isEmailConfigured} from './src/email-service';

function emailApiPlugin(): Plugin {
  return {
    name: 'email-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/email-status', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          configured: isEmailConfigured(),
          hasGmail: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
          hasSmtp: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
          hasResend: Boolean(process.env.RESEND_API_KEY)
        }));
      });

      server.middlewares.use('/api/send-ticket-email', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', chunk => { bodyStr += chunk; });
        req.on('end', async () => {
          try {
            const payload = JSON.parse(bodyStr || '{}');
            const result = await sendTicketEmail(payload);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, message: e.message || 'Server error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), emailApiPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          events: path.resolve(__dirname, 'events.html'),
          eventDetails: path.resolve(__dirname, 'event-details.html'),
          buyTicket: path.resolve(__dirname, 'buy-ticket.html'),
          checkout: path.resolve(__dirname, 'checkout.html'),
          payment: path.resolve(__dirname, 'payment.html'),
          organizerDashboard: path.resolve(__dirname, 'organizer-dashboard.html'),
          organizerRegister: path.resolve(__dirname, 'organizer-register.html'),
          ticket: path.resolve(__dirname, 'ticket.html'),
          contests: path.resolve(__dirname, 'contests.html'),
          contest: path.resolve(__dirname, 'contest.html'),
          contestDetails: path.resolve(__dirname, 'contest-details.html'),
          influencerDashboard: path.resolve(__dirname, 'influencer-dashboard.html'),
          controlPanel: path.resolve(__dirname, 'control-panel.html'),
          adminPanel: path.resolve(__dirname, 'admin-panel.html'),
          eventOnboarding: path.resolve(__dirname, 'event-onboarding.html'),
          createEvent: path.resolve(__dirname, 'create-event.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
