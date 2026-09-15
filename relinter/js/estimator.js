/**
 * SKYLA BY SV ALUMINIUM — LIVE FENESTRATION BOQ ESTIMATOR
 * Real-time calculation for aperture area, sash weight, thermal U-Value & BOQ quotation
 */

(function () {
  'use strict';

  const systemSelect = document.getElementById('calcSystem');
  const widthInput = document.getElementById('calcWidth');
  const heightInput = document.getElementById('calcHeight');
  const glassSelect = document.getElementById('calcGlass');
  const finishSelect = document.getElementById('calcFinish');

  const outArea = document.getElementById('outArea');
  const outWeight = document.getElementById('outWeight');
  const outUValue = document.getElementById('outUValue');
  const outAcoustic = document.getElementById('outAcoustic');
  const outEstimate = document.getElementById('outEstimate');

  function calculateBOQ() {
    if (!widthInput || !heightInput) return;

    const width = parseFloat(widthInput.value) || 3000; // mm
    const height = parseFloat(heightInput.value) || 2800; // mm
    const system = systemSelect ? systemSelect.value : 'sliding18';
    const glass = glassSelect ? glassSelect.value : 'dgu';

    // Area in sq.m and sq.ft
    const areaSqM = (width * height) / 1000000;
    const areaSqFt = areaSqM * 10.7639;

    // Weight estimate (glass ~2.5 kg/m2 per mm thickness + aluminium frame ~15 kg/m2)
    let glassThickness = glass === 'tgu' ? 36 : glass === 'laminated' ? 28 : 24; // mm
    let glassWeightPerSqM = glassThickness * 2.5;
    let frameWeightPerSqM = system === 'liftslide' ? 22 : system === 'bifold' ? 18 : 14;
    let totalWeight = Math.round(areaSqM * (glassWeightPerSqM + frameWeightPerSqM));

    // Thermal U-Value calculation
    let uValue = '1.4 W/m²K';
    let acousticDb = '38 dB';
    let baseRatePerSqFt = 1450; // INR

    if (system === 'sliding18') {
      baseRatePerSqFt = 1650;
      uValue = glass === 'tgu' ? '1.1 W/m²K' : '1.4 W/m²K';
      acousticDb = glass === 'laminated' ? '42 dB' : '38 dB';
    } else if (system === 'bifold') {
      baseRatePerSqFt = 1850;
      uValue = '1.5 W/m²K';
      acousticDb = '36 dB';
    } else if (system === 'liftslide') {
      baseRatePerSqFt = 2100;
      uValue = glass === 'tgu' ? '0.95 W/m²K' : '1.2 W/m²K';
      acousticDb = '42 dB';
    } else if (system === 'casement') {
      baseRatePerSqFt = 1250;
      uValue = '1.3 W/m²K';
      acousticDb = '44 dB';
    } else if (system === 'facade') {
      baseRatePerSqFt = 1950;
      uValue = '1.2 W/m²K';
      acousticDb = '40 dB';
    }

    // Glass multiplier
    if (glass === 'tgu') baseRatePerSqFt += 350;
    if (glass === 'laminated') baseRatePerSqFt += 250;

    const totalEstimate = Math.round(areaSqFt * baseRatePerSqFt);

    if (outArea) outArea.textContent = `${areaSqM.toFixed(1)} m² (${Math.round(areaSqFt)} sq.ft)`;
    if (outWeight) outWeight.textContent = `${totalWeight} kg`;
    if (outUValue) outUValue.textContent = uValue;
    if (outAcoustic) outAcoustic.textContent = acousticDb;
    if (outEstimate) outEstimate.textContent = `₹ ${totalEstimate.toLocaleString('en-IN')}`;
  }

  const calcInputs = [systemSelect, widthInput, heightInput, glassSelect, finishSelect];
  calcInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateBOQ);
      input.addEventListener('change', calculateBOQ);
    }
  });

  // Run on load
  calculateBOQ();

  // Form submission handler
  const estimateForm = document.getElementById('boqEstimatorForm');
  if (estimateForm) {
    estimateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('✦ BOQ Estimation Successfully Generated. Our Architectural Technical Director will contact you within 2 business hours with full CAD line-item tender drawings.');
    });
  }
})();
