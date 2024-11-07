export interface NewUserFormData {
    fullName: string;
    email: string;
    currency: string;
  }
  
  export interface ExistingUserFormData {
    walletAddress: string;
    secretKey: string;
  }
  
  export interface WalletInfo {
    address: string;
    balance: string;
    seed: string;
  }
  
  export interface Currency {
    code: string;
    name: string;
    flag: string;
    rate?: number;
  }
  
  export interface FormField {
    field: {
      name: string;
      value: string;
      onChange: (value: string) => void;
      onBlur: () => void;
      ref: React.Ref<any>;
    };
  }