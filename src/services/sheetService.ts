import { StudentRecord, EXACT_SHEET_COLUMNS } from '../types/crm';

export const SAMPLE_SHEET_ROW: StudentRecord = {
  id: 'stu-sample-1',
  studentId: 'STU-1001',
  applicationNumber: 'APP-2026-001',
  firstName: 'Ayaan',
  lastName: 'Khan',
  dateOfBirth: '2017-03-14',
  gender: 'Male',
  bloodGroup: 'O+',
  nationality: 'Pakistani',
  previousSchool: 'The City School',
  previousGrade: 'Grade 3',
  applicationDate: '2026-09-01',
  applyingGrade: 'Grade 4',
  admissionType: 'New',
  academicYear: '2026-2027',
};

const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/18l36z6AA70UwTLCEGuxMjYuVmTImxG1G1DSb5yb-Q6I/edit?gid=850970956';
const STORAGE_KEY = 'rising_glory_school_crm_data_v4';
const CONFIG_KEY = 'rising_glory_school_crm_db_url_v4';

export class SheetService {
  static getStoredRecords(): StudentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to read stored records', e);
    }
    return []; // Empty by default
  }

  static saveRecords(records: StudentRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('Failed to save records', e);
    }
  }

  static clearRecords() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  static getSavedSourceUrl(): string {
    return localStorage.getItem(CONFIG_KEY) || DEFAULT_SHEET_URL;
  }

  static saveSourceUrl(url: string) {
    localStorage.setItem(CONFIG_KEY, url);
  }

  static normalizeGoogleSheetUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';

    if (trimmed.includes('/export?format=csv') || trimmed.includes('/pub?output=csv')) {
      return trimmed;
    }

    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      const gidMatch = trimmed.match(/[?&#]gid=([0-9]+)/);
      const gidPart = gidMatch ? `&gid=${gidMatch[1]}` : '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidPart}`;
    }

    return trimmed;
  }

  /**
   * Fetches data from ANY database endpoint or Google Sheet URL in the frontend.
   * Supports:
   * - REST API JSON endpoints (e.g. Supabase, Firebase, mockapi, backend API)
   * - Google Sheets published CSV / export URLs
   * - CORS proxy fallback
   */
  static async fetchFromAnyDatabase(url: string): Promise<{ success: boolean; data?: StudentRecord[]; error?: string }> {
    const trimmed = url.trim();
    if (!trimmed) {
      return { success: false, error: 'Database or Spreadsheet URL cannot be empty.' };
    }

    const isGoogleSheet = trimmed.includes('docs.google.com/spreadsheets');
    const fetchUrl = isGoogleSheet ? this.normalizeGoogleSheetUrl(trimmed) : trimmed;

    try {
      let response: Response;
      try {
        response = await fetch(fetchUrl, {
          method: 'GET',
          headers: { Accept: 'application/json, text/csv, text/plain, */*' },
        });
      } catch (corsErr) {
        // Fallback through proxy for CORS-restricted endpoints
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fetchUrl)}`;
        response = await fetch(proxyUrl);
      }

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP Error ${response.status}: Unable to connect to database endpoint.`,
        };
      }

      const contentType = response.headers.get('content-type') || '';
      let text = await response.text();

      // Check if response is JSON (REST API / Database)
      if (contentType.includes('application/json') || text.trim().startsWith('[') || text.trim().startsWith('{')) {
        try {
          const json = JSON.parse(text);
          const arrayData = Array.isArray(json) ? json : json.data || json.records || json.students || [];

          if (Array.isArray(arrayData) && arrayData.length > 0) {
            const mappedRecords: StudentRecord[] = arrayData.map((item: any, idx: number) => ({
              id: item.id || `db-row-${Date.now()}-${idx}`,
              studentId: item.studentId || item.rollNo || item.roll_number || item.student_id || item['Student ID'] || `STU-${1000 + idx + 1}`,
              applicationNumber: item.applicationNumber || item.appNo || item.application_number || item['Application Number'] || `APP-2026-${String(idx + 1).padStart(3, '0')}`,
              firstName: item.firstName || item.first_name || item['First Name'] || '',
              lastName: item.lastName || item.last_name || item['Last Name'] || '',
              dateOfBirth: item.dateOfBirth || item.dob || item.date_of_birth || item['Date of Birth'] || '',
              gender: item.gender || item['Gender'] || 'Male',
              bloodGroup: item.bloodGroup || item.blood_group || item['Blood Group'] || 'O+',
              nationality: item.nationality || item['Nationality'] || '',
              previousSchool: item.previousSchool || item.prev_school || item.previous_school || item['Previous School'] || '',
              previousGrade: item.previousGrade || item.prev_grade || item.previous_grade || item['Previous Grade'] || '',
              applicationDate: item.applicationDate || item.app_date || item.application_date || item['Application Date'] || '',
              applyingGrade: item.applyingGrade || item.grade || item.applying_grade || item['Applying Grade'] || '',
              admissionType: item.admissionType || item.admission_type || item['Admission Type'] || 'New',
              academicYear: item.academicYear || item.academic_year || item['Academic Year'] || '2026-2027',
            }));

            this.saveSourceUrl(url);
            return { success: true, data: mappedRecords };
          }
        } catch (jsonErr) {
          // Fall back to CSV parsing
        }
      }

      // Parse as CSV/TSV
      const records = this.parseCsvOrTsv(text);
      if (records.length === 0) {
        return {
          success: false,
          error: 'Connected to source, but no valid data rows were returned.',
        };
      }

      this.saveSourceUrl(url);
      return { success: true, data: records };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error fetching data from database endpoint.',
      };
    }
  }

  static parseCsvOrTsv(rawText: string): StudentRecord[] {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const isTsv = firstLine.includes('\t');
    const delimiter = isTsv ? '\t' : ',';

    const parseLine = (line: string): string[] => {
      if (isTsv) {
        return line.split('\t').map((c) => c.trim().replace(/^"|"$/g, ''));
      }
      const row: string[] = [];
      let inQuotes = false;
      let current = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          row.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      return row;
    };

    const firstRowTokens = parseLine(firstLine).map((s) => s.toLowerCase());
    const hasHeader =
      firstRowTokens.some((t) => t.includes('student') || t.includes('first name') || t.includes('application') || t.includes('roll') || t.includes('gender') || t.includes('birth'));

    const colIndexMap: Record<keyof Omit<StudentRecord, 'id'>, number> = {
      studentId: -1,
      applicationNumber: -1,
      firstName: -1,
      lastName: -1,
      dateOfBirth: -1,
      gender: -1,
      bloodGroup: -1,
      nationality: -1,
      previousSchool: -1,
      previousGrade: -1,
      applicationDate: -1,
      applyingGrade: -1,
      admissionType: -1,
      academicYear: -1,
    };

    if (hasHeader) {
      firstRowTokens.forEach((header, idx) => {
        const h = header.trim();
        if ((h.includes('student') && h.includes('id')) || h.includes('roll')) {
          if (colIndexMap.studentId === -1) colIndexMap.studentId = idx;
        } else if (h.includes('app') && (h.includes('num') || h.includes('no'))) {
          if (colIndexMap.applicationNumber === -1) colIndexMap.applicationNumber = idx;
        } else if (h.includes('first') && h.includes('name')) {
          if (colIndexMap.firstName === -1) colIndexMap.firstName = idx;
        } else if (h.includes('last') && h.includes('name')) {
          if (colIndexMap.lastName === -1) colIndexMap.lastName = idx;
        } else if (h.includes('birth') || h.includes('dob')) {
          if (colIndexMap.dateOfBirth === -1) colIndexMap.dateOfBirth = idx;
        } else if (h.includes('gender') || h.includes('sex')) {
          if (colIndexMap.gender === -1) colIndexMap.gender = idx;
        } else if (h.includes('blood')) {
          if (colIndexMap.bloodGroup === -1) colIndexMap.bloodGroup = idx;
        } else if (h.includes('nation')) {
          if (colIndexMap.nationality === -1) colIndexMap.nationality = idx;
        } else if (h.includes('prev') && h.includes('school')) {
          if (colIndexMap.previousSchool === -1) colIndexMap.previousSchool = idx;
        } else if (h.includes('prev') && h.includes('grade')) {
          if (colIndexMap.previousGrade === -1) colIndexMap.previousGrade = idx;
        } else if (h.includes('app') && h.includes('date')) {
          if (colIndexMap.applicationDate === -1) colIndexMap.applicationDate = idx;
        } else if (h.includes('apply') && h.includes('grade')) {
          if (colIndexMap.applyingGrade === -1) colIndexMap.applyingGrade = idx;
        } else if (h.includes('admiss') || h.includes('type')) {
          if (colIndexMap.admissionType === -1) colIndexMap.admissionType = idx;
        } else if (h.includes('year')) {
          if (colIndexMap.academicYear === -1) colIndexMap.academicYear = idx;
        }
      });
    }

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const records: StudentRecord[] = [];

    dataLines.forEach((line, idx) => {
      const cols = parseLine(line);
      if (cols.length === 0 || cols.every((c) => !c)) return;

      const getVal = (key: keyof Omit<StudentRecord, 'id'>, fallbackCol: number, defaultVal = ''): string => {
        if (colIndexMap[key] !== -1 && cols[colIndexMap[key]] !== undefined) {
          return cols[colIndexMap[key]];
        }
        return cols[fallbackCol] !== undefined ? cols[fallbackCol] : defaultVal;
      };

      records.push({
        id: `row-${Date.now()}-${idx}`,
        studentId: getVal('studentId', 0, `STU-${1000 + idx + 1}`),
        applicationNumber: getVal('applicationNumber', 1, `APP-2026-${String(idx + 1).padStart(3, '0')}`),
        firstName: getVal('firstName', 2, ''),
        lastName: getVal('lastName', 3, ''),
        dateOfBirth: getVal('dateOfBirth', 4, ''),
        gender: getVal('gender', 5, 'Male'),
        bloodGroup: getVal('bloodGroup', 6, 'O+'),
        nationality: getVal('nationality', 7, ''),
        previousSchool: getVal('previousSchool', 8, ''),
        previousGrade: getVal('previousGrade', 9, ''),
        applicationDate: getVal('applicationDate', 10, ''),
        applyingGrade: getVal('applyingGrade', 11, ''),
        admissionType: getVal('admissionType', 12, 'New'),
        academicYear: getVal('academicYear', 13, '2026-2027'),
      });
    });

    return records;
  }
}
