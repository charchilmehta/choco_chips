/**
 * Health Controller
 * Allows patients to log and track health metrics like blood pressure,
 * blood sugar, and heart rate. Provides automated health status analysis.
 */

const HealthMetric = require('../models/HealthMetric');

/**
 * Analyze blood pressure and return status + suggestion
 * @param {number} systolic - Upper BP reading
 * @param {number} diastolic - Lower BP reading
 * @returns {{ status: string, suggestion: string }}
 */
const analyzeBP = (systolic, diastolic) => {
  if (systolic < 90 || diastolic < 60) {
    return { status: 'Low', suggestion: 'Your blood pressure is low. Drink water, rest, and consult a doctor if you feel dizzy.' };
  } else if (systolic > 120 || diastolic > 80) {
    return { status: 'High', suggestion: 'Your blood pressure is elevated. Reduce salt intake, exercise regularly, and consult a doctor.' };
  }
  return { status: 'Normal', suggestion: 'Blood pressure is in the healthy range. Keep it up!' };
};

/**
 * Analyze fasting blood sugar and return status + suggestion
 * @param {number} value - Blood sugar in mg/dL
 * @returns {{ status: string, suggestion: string }}
 */
const analyzeSugar = (value) => {
  if (value < 70) {
    return { status: 'Low', suggestion: 'Blood sugar is too low (hypoglycemia). Eat something sweet immediately and consult a doctor.' };
  } else if (value > 100) {
    return { status: 'High', suggestion: 'Blood sugar is elevated. Reduce sugar intake, exercise, and monitor regularly.' };
  }
  return { status: 'Normal', suggestion: 'Blood sugar is in the healthy range. Maintain a balanced diet.' };
};

/**
 * Analyze resting heart rate and return status + suggestion
 * @param {number} value - Heart rate in BPM
 * @returns {{ status: string, suggestion: string }}
 */
const analyzeHeartRate = (value) => {
  if (value < 60) {
    return { status: 'Low', suggestion: 'Heart rate is low (bradycardia). If you feel dizzy or fatigued, consult a doctor.' };
  } else if (value > 100) {
    return { status: 'High', suggestion: 'Heart rate is elevated (tachycardia). Rest, stay calm, and avoid caffeine. See a doctor if persistent.' };
  }
  return { status: 'Normal', suggestion: 'Heart rate is in the healthy range. Great job!' };
};

/**
 * @route   POST /api/health
 * @desc    Patient logs health metrics and gets instant analysis
 * @access  Private (patient)
 */
const logHealthMetrics = async (req, res) => {
  try {
    const { bp, sugar, heartRate } = req.body;

    // Validate that at least one metric is provided
    if (!bp && !sugar && !heartRate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one health metric (bp, sugar, or heartRate).',
      });
    }

    const metricData = { patient: req.user.id };
    const suggestions = [];
    let abnormalCount = 0;

    // Analyze blood pressure if provided
    if (bp && bp.systolic && bp.diastolic) {
      const { status, suggestion } = analyzeBP(bp.systolic, bp.diastolic);
      metricData.bp = { systolic: bp.systolic, diastolic: bp.diastolic, status };
      suggestions.push(suggestion);
      if (status !== 'Normal') abnormalCount++;
    }

    // Analyze blood sugar if provided
    if (sugar && sugar.value !== undefined) {
      const { status, suggestion } = analyzeSugar(sugar.value);
      metricData.sugar = { value: sugar.value, status };
      suggestions.push(suggestion);
      if (status !== 'Normal') abnormalCount++;
    }

    // Analyze heart rate if provided
    if (heartRate && heartRate.value !== undefined) {
      const { status, suggestion } = analyzeHeartRate(heartRate.value);
      metricData.heartRate = { value: heartRate.value, status };
      suggestions.push(suggestion);
      if (status !== 'Normal') abnormalCount++;
    }

    // Determine overall health status
    if (abnormalCount === 0) {
      metricData.overallStatus = 'All metrics are normal. Excellent health!';
    } else if (abnormalCount === 1) {
      metricData.overallStatus = 'One metric needs attention. Monitor closely.';
    } else {
      metricData.overallStatus = 'Multiple metrics are abnormal. Please consult a doctor.';
    }

    metricData.suggestions = suggestions;

    // Save to database
    const savedMetric = await HealthMetric.create(metricData);

    res.status(201).json({
      success: true,
      message: 'Health metrics logged and analyzed.',
      data: {
        bp: metricData.bp ? {
          value: `${bp.systolic}/${bp.diastolic} mmHg`,
          status: metricData.bp.status,
          suggestion: suggestions[0],
        } : null,
        sugar: metricData.sugar ? {
          value: `${sugar.value} mg/dL`,
          status: metricData.sugar.status,
          suggestion: suggestions[metricData.bp ? 1 : 0],
        } : null,
        heartRate: metricData.heartRate ? {
          value: `${heartRate.value} BPM`,
          status: metricData.heartRate.status,
          suggestion: suggestions[suggestions.length - 1],
        } : null,
        overallStatus: metricData.overallStatus,
        suggestions,
        recordId: savedMetric._id,
      },
    });
  } catch (error) {
    console.error('LogHealthMetrics error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @route   GET /api/health/history
 * @desc    Get past health metric logs for the logged-in patient
 * @access  Private (patient)
 */
const getHealthHistory = async (req, res) => {
  try {
    const { limit = 30 } = req.query;

    const history = await HealthMetric.find({ patient: req.user.id })
      .sort({ recordedAt: -1 }) // Most recent first
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: history,
      message: `Found ${history.length} health record(s).`,
    });
  } catch (error) {
    console.error('GetHealthHistory error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { logHealthMetrics, getHealthHistory };
