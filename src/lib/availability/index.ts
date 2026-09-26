import { BusinessAvailability, Service, Appointment } from '../../types';

export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  reason?: string;
}

/**
 * Converts "HH:mm" to total minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Converts total minutes since midnight to "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Computes available slots for a given business, service, and calendar date (YYYY-MM-DD)
 */
export function getAvailableSlots(
  availability: BusinessAvailability,
  service: Service,
  dateStr: string,
  existingBookings: Appointment[]
): TimeSlot[] {
  if (!availability || !service || !dateStr) return [];

  const targetDate = new Date(`${dateStr}T00:00:00`);
  const now = new Date();

  // Validate advance booking limits
  const diffTime = targetDate.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return []; // Past date
  }

  if (diffDays > (availability.maxAdvanceDays || 60)) {
    return []; // Beyond maximum booking window
  }

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = targetDate.getDay();
  const schedule = availability.workingDays.find((d) => d.dayOfWeek === dayOfWeek);

  if (!schedule || !schedule.isOpen) {
    return []; // Business closed on this day
  }

  const workStartMin = timeToMinutes(schedule.startTime);
  const workEndMin = timeToMinutes(schedule.endTime);
  const serviceDuration = service.durationMinutes || 30;
  const bufferBefore = service.bufferBeforeMinutes || 0;
  const bufferAfter = service.bufferAfterMinutes || 0;
  const totalOccupiedMin = serviceDuration + bufferBefore + bufferAfter;
  const slotInterval = availability.slotIntervalMinutes || 30;

  // Filter existing active appointments on this specific date
  const dayAppointments = existingBookings.filter(
    (app) => app.date === dateStr && app.status !== 'cancelled'
  );

  const slots: TimeSlot[] = [];

  // Minimum notice validation
  const minNoticeHours = availability.minNoticeHours || 2;
  const minNoticeMs = now.getTime() + minNoticeHours * 60 * 60 * 1000;

  for (let current = workStartMin; current + serviceDuration <= workEndMin; current += slotInterval) {
    const slotStartMin = current;
    const slotEndMin = current + serviceDuration;

    const slotStartTimeStr = minutesToTime(slotStartMin);
    const slotEndTimeStr = minutesToTime(slotEndMin);

    // Check if slot falls in the past or violates minimum booking notice
    const slotDateTime = new Date(`${dateStr}T${slotStartTimeStr}:00`);
    if (slotDateTime.getTime() < minNoticeMs) {
      continue; // Too close or in past, do not offer
    }

    // Check conflict with business breaks
    let conflictsWithBreak = false;
    if (schedule.breaks && schedule.breaks.length > 0) {
      for (const b of schedule.breaks) {
        const breakStart = timeToMinutes(b.startTime);
        const breakEnd = timeToMinutes(b.endTime);

        // Overlap check: slotStart < breakEnd && slotEnd > breakStart
        if (slotStartMin < breakEnd && slotEndMin > breakStart) {
          conflictsWithBreak = true;
          break;
        }
      }
    }

    if (conflictsWithBreak) {
      continue;
    }

    // Check conflict with existing appointments including their buffers
    let hasConflict = false;
    for (const app of dayAppointments) {
      const appStartMin = timeToMinutes(app.startTime) - (service.bufferBeforeMinutes || 0);
      const appEndMin = timeToMinutes(app.endTime) + (service.bufferAfterMinutes || 0);

      // Overlap check
      if (slotStartMin < appEndMin && slotEndMin > appStartMin) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      slots.push({
        startTime: slotStartTimeStr,
        endTime: slotEndTimeStr,
        available: true,
      });
    }
  }

  return slots;
}

/**
 * Checks whether a specific requested slot is conflict-free and valid.
 * Strictly used before creating a booking transactionally.
 */
export function validateBookingSlotAvailability(
  availability: BusinessAvailability,
  service: Service,
  dateStr: string,
  startTimeStr: string,
  existingBookings: Appointment[]
): { valid: boolean; reason?: string } {
  const availableSlots = getAvailableSlots(availability, service, dateStr, existingBookings);
  const matching = availableSlots.find((s) => s.startTime === startTimeStr && s.available);

  if (!matching) {
    return {
      valid: false,
      reason: 'The selected timeslot is no longer available. Please choose another time.',
    };
  }

  return { valid: true };
}
