const STEPPER_STAGES = ['Draft', 'Dispatched', 'On Trip', 'Completed'];

export default function TripStepper({ status }) {
  if (status === 'Cancelled') {
    return <div style={{ color: 'var(--red)', fontWeight: 600, textAlign: 'center', padding: 10 }}>Trip Cancelled</div>;
  }

  const currentIndex = STEPPER_STAGES.indexOf(status);
  
  return (
    <div className="trip-stepper">
      <div className="stepper-line" />
      {STEPPER_STAGES.map((stage, i) => {
        const isCompleted = i < currentIndex || status === 'Completed';
        const isActive = i === currentIndex && status !== 'Completed';
        
        let icon = 'ti-circle';
        if (isCompleted) icon = 'ti-check';
        if (isActive && stage === 'Draft') icon = 'ti-edit';
        if (isActive && stage === 'Dispatched') icon = 'ti-send';
        if (isActive && stage === 'On Trip') icon = 'ti-truck-delivery';
        
        return (
          <div className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`} key={stage}>
            <div className="stepper-circle">
              <i className={`ti ${icon}`} />
            </div>
            <div className="stepper-label">{stage}</div>
          </div>
        );
      })}
    </div>
  );
}
