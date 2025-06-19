declare module "zxcvbn" {
  interface ZXCVBNResult {
    score: number; // 0 - 4
    feedback: {
      warning: string;
      suggestions: string[];
    };
    crack_times_display: {
      offline_fast_hashing_1e10_per_second: string;
    };
    password: string;
    guesses: number;
    guesses_log10: number;
    calc_time: number;
  }

  function zxcvbn(password: string): ZXCVBNResult;

  export = zxcvbn;
}

declare module 'density-clustering';