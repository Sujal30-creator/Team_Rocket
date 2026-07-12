const MAP = {
  // Vehicle / Driver
  Available:  'b-available',
  'On Trip':  'b-ontrip',
  'In Shop':  'b-shop',
  'Off Duty': 'b-offduty',
  Suspended:  'b-offduty',
  Retired:    'b-offduty',

  // Trip
  Draft:      'b-offduty',
  Dispatched: 'b-running',
  Completed:  'b-available',
  Cancelled:  'b-offduty',
};

export default function Badge({ status }) {
  const cls = MAP[status] || 'b-offduty';
  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
