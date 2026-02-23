//TODO:tsx->ts

import React, { createContext, useState, ReactNode } from 'react'

type StepContextType = {
  stepNumber: number
  nextStep: () => void
}

export const StepContext = createContext<StepContextType>({
  nextStep: () => {},
  stepNumber: 1,
})

const StepProvider = ({ children }: { children: ReactNode }) => {
  const [stepNumber, setStepNumber] = useState(1)

  const nextStep = () => setStepNumber((prev) => prev + 1)

  return (
    <StepContext.Provider value={{ nextStep, stepNumber }}>
      {children}
    </StepContext.Provider>
  )
}

export default StepProvider
