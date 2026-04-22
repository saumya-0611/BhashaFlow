/**
 * StepIndicator.jsx
 * Shared step progress indicator for the grievance flow.
 * Shows all 4 steps: Describe → Verify → Details → Review
 */
import './StepIndicator.css';

const STEPS = ['Describe', 'Verify', 'Details', 'Review'];

export default function StepIndicator({ currentStep = 0 }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, i) => (
        <div
          key={label}
          className={`step-item ${i < currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}
        >
          <div className="step-circle">
            {i < currentStep ? (
              <span className="material-symbols-outlined step-check">check</span>
            ) : (
              <span className="step-number">{i + 1}</span>
            )}
          </div>
          <span className="step-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
