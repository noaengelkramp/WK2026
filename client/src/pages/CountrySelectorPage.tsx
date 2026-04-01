import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import { useNavigate } from 'react-router-dom';
import type { EventContext } from '../services/eventService';
import { eventService } from '../services/eventService';

const PRIVACY_POLICY_URL =
  import.meta.env.VITE_LEGAL_PRIVACY_URL || 'https://www.kramp.com/privacy';
const TERMS_URL =
  import.meta.env.VITE_LEGAL_TERMS_URL || 'https://www.kramp.com/terms';
const COOKIE_POLICY_URL =
  import.meta.env.VITE_LEGAL_COOKIE_URL || 'https://www.kramp.com/cookies';

const isSameLegalLink = (left: string, right: string): boolean => {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
};

const buildTargetUrl = (subdomain: string): string => {
  const protocol = window.location.protocol;
  const host = window.location.hostname;

  const usePathRouting = (import.meta.env.VITE_EVENT_ROUTING_MODE || 'path').toLowerCase() === 'path';
  if (usePathRouting) {
    return `${protocol}//${host}/${subdomain}`;
  }

  // Local development convenience: use subdomain.localhost
  if (host === 'localhost' || host.endsWith('.localhost')) {
    if (usePathRouting) {
      return `${protocol}//${host}${window.location.port ? `:${window.location.port}` : ''}/${subdomain}`;
    }
    return `${protocol}//${subdomain}.localhost${window.location.port ? `:${window.location.port}` : ''}`;
  }

  // Handle configured/root selector hosts, e.g. poules.kramp.com -> <event>.poules.kramp.com
  const normalizedHost = host.replace(/^www\./, '');
  const rootSelectorHost = (import.meta.env.VITE_ROOT_SELECTOR_HOST || 'poules.kramp.com')
    .toLowerCase()
    .replace(/^www\./, '');

  if (normalizedHost === rootSelectorHost) {
    return `${protocol}//${subdomain}.${rootSelectorHost}`;
  }

  // If already on event subdomain like de.poules.kramp.com, switch first label only
  const hostParts = normalizedHost.split('.');
  const rootParts = rootSelectorHost.split('.');
  if (hostParts.length > rootParts.length && normalizedHost.endsWith(`.${rootSelectorHost}`)) {
    return `${protocol}//${subdomain}.${rootSelectorHost}`;
  }

  // Generic fallback for unknown hosts (replace first label)
  if (hostParts.length >= 3) {
    return `${protocol}//${subdomain}.${hostParts.slice(1).join('.')}`;
  }

  return `${protocol}//${subdomain}.${normalizedHost}`;
};

const isPathRoutingMode = (): boolean => {
  return (import.meta.env.VITE_EVENT_ROUTING_MODE || 'path').toLowerCase() === 'path';
};

export default function CountrySelectorPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventService.getCurrent();

        if (response.mode === 'event' && response.event) {
          if (isPathRoutingMode()) {
            navigate(`/${response.event.subdomain}`);
          } else {
            const destination = buildTargetUrl(response.event.subdomain);
            window.location.href = destination;
          }
          return;
        }

        if (response.mode === 'selector' && response.availableEvents) {
          setEvents(response.availableEvents);
          return;
        }

        setError(response.message || 'Unable to load country events.');
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load country list.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.name.localeCompare(b.name)),
    [events]
  );

  const resolvedPrivacyUrl = sortedEvents[0]?.legalPrivacyUrl || PRIVACY_POLICY_URL;
  const resolvedTermsUrl = sortedEvents[0]?.legalTermsUrl || TERMS_URL;
  const resolvedCookieUrl = sortedEvents[0]?.legalCookieUrl || COOKIE_POLICY_URL;

  const combinePrivacyAndCookie = isSameLegalLink(resolvedPrivacyUrl, resolvedCookieUrl);

  return (
    <Container maxWidth="lg" sx={{ py: 8, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <PublicIcon sx={{ fontSize: 42, color: '#9B1915', mb: 1 }} />
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Select Your Country Event
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Each country has its own participant base, prizes, and leaderboard.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#9B1915' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" variant="outlined">{error}</Alert>
      ) : sortedEvents.length === 0 ? (
        <Alert severity="info" variant="outlined">No active country events found.</Alert>
      ) : (
        <Grid container spacing={3}>
          {sortedEvents.map((event) => (
            <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {event.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Subdomain: {event.subdomain}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Languages: {event.allowedLocales.join(', ')}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                  onClick={() => {
                      localStorage.setItem('preferredEventSubdomain', event.subdomain);
                      if (isPathRoutingMode()) {
                        navigate(`/${event.subdomain}`);
                      } else {
                        window.location.href = buildTargetUrl(event.subdomain);
                      }
                    }}
                  >
                    Enter {event.name}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box
        component="footer"
        sx={{
          mt: 'auto',
          pt: 5,
          pb: 2,
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          By entering an event, you agree to the applicable terms and privacy notice.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {combinePrivacyAndCookie ? (
            <Button
              size="small"
              variant="text"
              component="a"
              href={resolvedPrivacyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy & Cookie Policy
            </Button>
          ) : (
            <>
              <Button
                size="small"
                variant="text"
                component="a"
                href={resolvedPrivacyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Button>
              <Button
                size="small"
                variant="text"
                component="a"
                href={resolvedCookieUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Cookie Policy
              </Button>
            </>
          )}
          <Button
            size="small"
            variant="text"
            component="a"
            href={resolvedTermsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
