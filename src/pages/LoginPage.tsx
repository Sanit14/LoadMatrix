import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, TextInput, PasswordInput, Button, Alert, Title, Center, Stack, Badge } from '@mantine/core';
import { IconAlertCircle, IconTerminal } from '@tabler/icons-react';
import { useAuthStore } from '../stores/authStore';
import { signInWithPassword, fetchUserProfile } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setProfile } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await signInWithPassword(email, password);
      
      if (authError) {
        throw authError;
      }

      if (data.user) {
        setUser(data.user);
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          if (!profile.is_active) {
            throw new Error('Your account has been deactivated. Please contact a supervisor.');
          }
          setProfile(profile);
          navigate('/home');
        } else {
          throw new Error('Failed to retrieve user profile. Please contact support.');
        }
      } else {
        throw new Error('An unexpected auth error occurred.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center style={{ width: '100vw', height: '100vh', backgroundColor: '#0a0a0a' }}>
      <Paper
        p="xl"
        radius="md"
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#141414',
          border: '1px solid #313131',
        }}
      >
        <form onSubmit={handleLogin}>
          <Stack gap="md">
            {/* Header Badge */}
            <Center>
              <Badge color="dataBlue" radius="sm" variant="filled" size="lg" style={{ fontFamily: 'JetBrains Mono' }} leftSection={<IconTerminal size={14} />}>
                ATME TERMINAL
              </Badge>
            </Center>

            <Title order={3} ta="center" style={{ fontFamily: 'JetBrains Mono', color: '#ffffff', letterSpacing: '-0.021px' }}>
              SIGN IN
            </Title>

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} title="Authentication Failed" color="red" variant="filled">
                {error}
              </Alert>
            )}

            <TextInput
              label="Operator Email"
              placeholder="operator@atme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <PasswordInput
              label="Security Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="filled"
              styles={{
                input: { backgroundColor: '#0a0a0a', border: '1px solid #313131', color: '#ffffff' },
                label: { color: '#a7a7a7', fontFamily: 'JetBrains Mono', fontSize: '12px' },
              }}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              style={{
                fontFamily: 'JetBrains Mono',
                marginTop: '8px',
                backgroundColor: '#ffffff',
                color: '#0a0a0a',
                fontWeight: 600,
              }}
            >
              INITIALIZE SESSION
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
