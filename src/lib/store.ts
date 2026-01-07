import { create } from "zustand";
import type { Id } from "../../convex/_generated/dataModel";

interface Photo {
  storageId: string;
  url: string;
  fileName: string;
}

interface OrderState {
  // Step tracking
  currentStep: number;

  // Selections
  selectedBookTypeId: Id<"bookTypes"> | null;
  selectedPageOptionId: Id<"pageOptions"> | null;
  selectedCoverDesignId: Id<"coverDesigns"> | null;

  // Photo book ID after creation
  photoBookId: Id<"photoBooks"> | null;
  shareId: string | null;

  // Uploaded photos
  uploadedPhotos: Photo[];

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setSelectedBookTypeId: (id: Id<"bookTypes"> | null) => void;
  setSelectedPageOptionId: (id: Id<"pageOptions"> | null) => void;
  setSelectedCoverDesignId: (id: Id<"coverDesigns"> | null) => void;
  setPhotoBookId: (id: Id<"photoBooks"> | null) => void;
  setShareId: (shareId: string | null) => void;
  addUploadedPhoto: (photo: Photo) => void;
  removeUploadedPhoto: (storageId: string) => void;
  setUploadedPhotos: (photos: Photo[]) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  selectedBookTypeId: null,
  selectedPageOptionId: null,
  selectedCoverDesignId: null,
  photoBookId: null,
  shareId: null,
  uploadedPhotos: [],
};

export const useOrderStore = create<OrderState>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),

  prevStep: () =>
    set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),

  setSelectedBookTypeId: (id) => set({ selectedBookTypeId: id }),

  setSelectedPageOptionId: (id) => set({ selectedPageOptionId: id }),

  setSelectedCoverDesignId: (id) => set({ selectedCoverDesignId: id }),

  setPhotoBookId: (id) => set({ photoBookId: id }),

  setShareId: (shareId) => set({ shareId }),

  addUploadedPhoto: (photo) =>
    set((state) => ({
      uploadedPhotos: [...state.uploadedPhotos, photo],
    })),

  removeUploadedPhoto: (storageId) =>
    set((state) => ({
      uploadedPhotos: state.uploadedPhotos.filter(
        (p) => p.storageId !== storageId,
      ),
    })),

  setUploadedPhotos: (photos) => set({ uploadedPhotos: photos }),

  reset: () => set(initialState),
}));

// Admin auth store
interface AdminState {
  isAuthenticated: boolean;
  adminId: Id<"admins"> | null;
  adminEmail: string | null;
  setAuth: (adminId: Id<"admins">, email: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAuthenticated: false,
  adminId: null,
  adminEmail: null,

  setAuth: (adminId, email) => {
    localStorage.setItem("adminId", adminId);
    localStorage.setItem("adminEmail", email);
    set({ isAuthenticated: true, adminId, adminEmail: email });
  },

  logout: () => {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminEmail");
    set({ isAuthenticated: false, adminId: null, adminEmail: null });
  },

  loadFromStorage: () => {
    const adminId = localStorage.getItem("adminId") as Id<"admins"> | null;
    const adminEmail = localStorage.getItem("adminEmail");
    if (adminId && adminEmail) {
      set({ isAuthenticated: true, adminId, adminEmail });
    }
  },
}));
