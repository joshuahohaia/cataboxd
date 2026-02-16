import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface UserInputProps {
  onSubmit: (username: string) => void;
  isLoading: boolean;
  error: string | null;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
`;

const Logo = styled(motion.h1)`
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  letter-spacing: -2px;
`;

const Tagline = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-bottom: 48px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 320px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Prefix = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 120px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s, background 0.2s;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: white;
  color: #1a1a1a;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled(motion.p)`
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
`;

const LoadingDots = styled.span`
  &::after {
    content: '';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0%, 20% { content: ''; }
    40% { content: '.'; }
    60% { content: '..'; }
    80%, 100% { content: '...'; }
  }
`;

export function UserInput({ onSubmit, isLoading, error }: UserInputProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      onSubmit(username);
    }
  };

  return (
    <Container>
      <Logo
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Cataboxd
      </Logo>
      <Tagline>Your Letterboxd diary, visualized</Tagline>

      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <Prefix>letterboxd.com/</Prefix>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            disabled={isLoading}
            autoFocus
          />
        </InputWrapper>

        <Button
          type="submit"
          disabled={isLoading || !username.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>Loading<LoadingDots /></>
          ) : (
            'View Diary'
          )}
        </Button>

        {error && (
          <ErrorText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </ErrorText>
        )}
      </Form>
    </Container>
  );
}
