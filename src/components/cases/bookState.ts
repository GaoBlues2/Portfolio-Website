export type BookPose = { opening: number; lift: number; invalidate?: () => void }
export const restingBook = (): BookPose => ({ opening: 0, lift: 0 })
