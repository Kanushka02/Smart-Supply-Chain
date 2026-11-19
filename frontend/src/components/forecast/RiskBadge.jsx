import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaInfoCircle
} from 'react-icons/fa';

export default function RiskBadge({ status }) {
  switch (status) {
    case 'HEALTHY':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <FaCheckCircle className="text-emerald-600" />
          Healthy Stock
        </span>
      );
    case 'POTENTIAL_SHORTAGE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
          <FaExclamationTriangle className="text-amber-600" />
          Potential Shortage
        </span>
      );
    case 'CRITICAL_SHORTAGE':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <FaExclamationCircle className="text-rose-600" />
          Critical Shortage
        </span>
      );
    case 'OVERSTOCK_RISK':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <FaInfoCircle className="text-blue-600" />
          Overstock Risk
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
          Unavailable
        </span>
      );
  }
}
