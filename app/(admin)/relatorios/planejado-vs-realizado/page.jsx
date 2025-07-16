"use client";

import RelatorioPlanejadoRealizado from '@/components/relatorios/RelatorioPlanejadoRealizado';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PlanejadoVsRealizadoPage() {
  return (
    <>
      <RelatorioPlanejadoRealizado />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
