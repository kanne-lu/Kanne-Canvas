import { useState } from 'react';
import { Calendar, Check, Loader2 } from 'lucide-react';
import { pointsApi } from './pointsApi';
import type { CheckInResult } from './types';

interface CheckInProps {
  todayCheckedIn: boolean;
  consecutiveDays: number;
  onCheckInSuccess: (result: CheckInResult) => void;
}

export function CheckIn({ todayCheckedIn, consecutiveDays, onCheckInSuccess }: CheckInProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckIn = async () => {
    if (todayCheckedIn || loading) return;

    setLoading(true);
    setError('');

    try {
      const result = await pointsApi.checkIn();
      onCheckInSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '签到失败');
    } finally {
      setLoading(false);
    }
  };

  const getPointsText = () => {
    if (consecutiveDays >= 7) return '50 积分';
    if (consecutiveDays >= 3) return '20 积分';
    return '10 积分';
  };

  return (
    <div className="check-in-card">
      <div className="check-in-header">
        <Calendar size={20} />
        <h3>每日签到</h3>
      </div>

      <div className="check-in-info">
        <div className="consecutive-days">
          <span className="days-number">{consecutiveDays}</span>
          <span className="days-label">连续签到天数</span>
        </div>
        <div className="reward-preview">
          <span>今日签到可得</span>
          <span className="points-reward">{getPointsText()}</span>
        </div>
      </div>

      {error && <div className="check-in-error">{error}</div>}

      <button
        className={`check-in-button ${todayCheckedIn ? 'checked' : ''}`}
        onClick={handleCheckIn}
        disabled={todayCheckedIn || loading}
      >
        {loading ? (
          <>
            <Loader2 className="spin" size={16} />
            签到中...
          </>
        ) : todayCheckedIn ? (
          <>
            <Check size={16} />
            已签到
          </>
        ) : (
          '立即签到'
        )}
      </button>

      {todayCheckedIn && (
        <div className="check-in-success">
          明天继续签到可获得更多积分哦！
        </div>
      )}
    </div>
  );
}
