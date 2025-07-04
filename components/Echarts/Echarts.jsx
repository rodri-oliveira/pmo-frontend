'use client';

import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

const EChart = ({ option, style }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chartInstance = null;
    if (chartRef.current) {
      chartInstance = echarts.init(chartRef.current);
      chartInstance.setOption(option);
    }

    const resizeChart = () => {
      chartInstance?.resize();
    };

    window.addEventListener('resize', resizeChart);

    return () => {
      chartInstance?.dispose();
      window.removeEventListener('resize', resizeChart);
    };
  }, [option]);

  return <div ref={chartRef} style={{ width: '100%', height: '100%', ...style }} />;
};

export default EChart;
