const MAP = {
  Available: 'b-available',
  'On Trip': 'b-ontrip',
  'In Shop': 'b-shop',
  'Off Duty': 'b-offduty',
  Suspended: 'b-offduty',
  Running: 'b-ontrip',
  Completed: 'b-available',
  Cancelled: 'b-offduty',
};

export default function Badge({ status }) {
  return <span className={`badge ${MAP[status] || 'b-offduty'}`}>{status}</span>;
}
