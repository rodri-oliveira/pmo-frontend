'use client';

import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

const EChart = ({ option, style, onEvents }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chartInstance = null;
    if (chartRef.current) {
      chartInstance = echarts.init(chartRef.current);
      chartInstance.setOption(option);

      // Register event listeners from onEvents prop
      if (onEvents) {
        Object.entries(onEvents).forEach(([eventName, handler]) => {
          chartInstance.on(eventName, handler);
        });
      }
    }

    const resizeChart = () => {
      chartInstance?.resize();
    };

    window.addEventListener('resize', resizeChart);

    // Cleanup
    return () => {
      chartInstance?.dispose(); // This also removes all event listeners
      window.removeEventListener('resize', resizeChart);
    };
  }, [option, onEvents]); // Rerun effect if option or event handlers change

  return <div ref={chartRef} style={{ width: '100%', height: '100%', ...style }} />;
};

export default EChart;
