/**
 * VFSTR Smart Transport — Real-Time Boarding Attendance Service
 * Handles live synchronization between driver QR scanner and student pass/dashboard.
 */

export interface BoardingAttendanceRecord {
  id: string;
  rollNo: string;
  studentName: string;
  routeNumber: string;
  busRegNo: string;
  driverName: string;
  seatNumber: string;
  boardedAtTime: string;
  boardedDate: string;
  stopName: string;
  status: 'BOARDED' | 'IN_TRANSIT' | 'COMPLETED';
}

const ATTENDANCE_CHANNEL = 'vfstr_attendance_sync';

export class AttendanceService {
  private static channel: BroadcastChannel | null = (() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      return new BroadcastChannel(ATTENDANCE_CHANNEL);
    }
    return null;
  })();

  /**
   * Broadcasts a verified boarding scan from the driver
   */
  static recordBoarding(record: Omit<BoardingAttendanceRecord, 'id' | 'boardedDate'>): BoardingAttendanceRecord {
    const today = new Date().toISOString().split('T')[0];
    const fullRecord: BoardingAttendanceRecord = {
      ...record,
      id: `att_${Date.now()}_${record.rollNo}`,
      boardedDate: today,
    };

    // 1. Cache in LocalStorage for persistence
    try {
      localStorage.setItem(`vfstr_active_boarding_${record.rollNo.toUpperCase()}`, JSON.stringify(fullRecord));
      
      // Also append to boarding log history
      const historyKey = `vfstr_boarding_history_${record.rollNo.toUpperCase()}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      localStorage.setItem(historyKey, JSON.stringify([fullRecord, ...existing.slice(0, 30)]));
    } catch {
      // storage quota fallback
    }

    // 2. Broadcast across tabs/devices via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'STUDENT_BOARDED', payload: fullRecord });
      } catch {
        // channel error
      }
    }

    // 3. Dispatch window CustomEvent for immediate reactivity in current window
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vfstr_student_boarded', { detail: fullRecord }));
    }

    return fullRecord;
  }

  /**
   * Gets today's active boarding record for a student
   */
  static getTodayBoarding(rollNo: string): BoardingAttendanceRecord | null {
    if (!rollNo) return null;
    try {
      const saved = localStorage.getItem(`vfstr_active_boarding_${rollNo.toUpperCase()}`);
      if (!saved) return null;
      const record: BoardingAttendanceRecord = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (record.boardedDate === today) {
        return record;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Subscribes to real-time boarding updates for a student
   */
  static subscribeToStudentBoarding(
    rollNo: string,
    onBoarded: (record: BoardingAttendanceRecord) => void
  ): () => void {
    const cleanRoll = rollNo.toUpperCase();

    // 1. Check existing record on load
    const current = this.getTodayBoarding(cleanRoll);
    if (current) {
      onBoarded(current);
    }

    // 2. BroadcastChannel handler
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'STUDENT_BOARDED') {
        const record = event.data.payload as BoardingAttendanceRecord;
        if (record && record.rollNo.toUpperCase() === cleanRoll) {
          onBoarded(record);
        }
      }
    };

    if (this.channel) {
      this.channel.addEventListener('message', handleBroadcast);
    }

    // 3. Window CustomEvent handler
    const handleWindowEvent = (event: Event) => {
      const customEvt = event as CustomEvent<BoardingAttendanceRecord>;
      if (customEvt.detail && customEvt.detail.rollNo.toUpperCase() === cleanRoll) {
        onBoarded(customEvt.detail);
      }
    };

    window.addEventListener('vfstr_student_boarded', handleWindowEvent);

    return () => {
      if (this.channel) {
        this.channel.removeEventListener('message', handleBroadcast);
      }
      window.removeEventListener('vfstr_student_boarded', handleWindowEvent);
    };
  }

  /**
   * Clears active boarding (e.g. for simulation reset)
   */
  static clearBoarding(rollNo: string) {
    try {
      localStorage.removeItem(`vfstr_active_boarding_${rollNo.toUpperCase()}`);
      window.dispatchEvent(new CustomEvent('vfstr_student_boarded_cleared', { detail: { rollNo } }));
    } catch {
      // ignore
    }
  }
}
