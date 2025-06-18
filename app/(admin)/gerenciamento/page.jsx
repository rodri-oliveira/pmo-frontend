import { Suspense } from 'react';
import GerenciamentoCascade from '@/components/gerenciamento/GerenciamentoCascade';
import { Box, CircularProgress } from '@mui/material';

export default function Page() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    }>
      <GerenciamentoCascade />
    </Suspense>
  );
}
