// src/utils/dateHelper.ts

export const calculateWorkingDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;
  
    let count = 0;
    let curDate = new Date(start.getTime());
  
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      // 0 = Minggu, 6 = Sabtu (Anggap hari kerja Senin - Jumat)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
  
    return count;
  };
  
  export const formatDateID = (dateString: string): string => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };