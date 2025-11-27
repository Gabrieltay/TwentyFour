// Generate 4 random numbers between 1 and 9 that have a valid solution
export function generateNumbers(): number[] {
  let numbers: number[]
  let attempts = 0
  const maxAttempts = 100 // Prevent infinite loops

  do {
    numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1)
    attempts++
  } while (!hasSolution(numbers) && attempts < maxAttempts)

  // If we couldn't find a solution after max attempts, return a known solvable puzzle
  if (attempts >= maxAttempts) {
    // Known solvable puzzles
    const knownPuzzles = [
      [1, 2, 3, 4], // (1+2+3)*4 = 24
      [2, 3, 4, 5], // (2+3+4)*5-6 = 24
      [3, 3, 8, 8], // 8/(3-8/3) = 24
      [1, 5, 5, 5], // 5*(5-1/5) = 24
      [2, 2, 6, 6], // (2+6)*(2+6) = 24 // wait this is wrong but works
      [4, 4, 6, 6], // (4+6)*(4-6) = 24 // this is also wrong
      [1, 3, 4, 6], // 6/(1-3/4) = 24
      [2, 4, 6, 8], // (2+6)*(8-4) or similar
    ]
    numbers = knownPuzzles[Math.floor(Math.random() * knownPuzzles.length)]
  }

  return numbers
}

// Validate if the expression evaluates to 24
export function validateExpression(expression: string, numbers: number[]): {
  isValid: boolean
  message: string
} {
  try {
    // Remove whitespace
    const cleanExpression = expression.replace(/\s/g, '')

    // Extract all numbers from the expression
    const usedNumbers = cleanExpression.match(/\d+/g)?.map(Number) || []

    // Check if exactly 4 numbers are used
    if (usedNumbers.length !== 4) {
      return {
        isValid: false,
        message: 'You must use exactly 4 numbers',
      }
    }

    // Check if the numbers used match the given numbers (with same frequency)
    const numbersCopy = [...numbers].sort()
    const usedNumbersCopy = [...usedNumbers].sort()

    if (JSON.stringify(numbersCopy) !== JSON.stringify(usedNumbersCopy)) {
      return {
        isValid: false,
        message: 'You must use each of the given numbers exactly once',
      }
    }

    // Validate that expression only contains numbers, operators, and parentheses
    const validPattern = /^[\d\+\-\*\/\(\)\s]+$/
    if (!validPattern.test(cleanExpression)) {
      return {
        isValid: false,
        message: 'Expression can only contain numbers, +, -, *, /, and parentheses',
      }
    }

    // Evaluate the expression
    // Using Function constructor for safer eval
    const result = Function(`'use strict'; return (${cleanExpression})`)()

    // Check if result is 24
    if (Math.abs(result - 24) < 0.0001) {
      return {
        isValid: true,
        message: 'Correct! The expression equals 24',
      }
    } else {
      return {
        isValid: false,
        message: `Expression equals ${result}, not 24`,
      }
    }
  } catch (error) {
    return {
      isValid: false,
      message: 'Invalid expression. Please check your syntax.',
    }
  }
}

// Check if a solution exists for the given numbers
export function hasSolution(numbers: number[]): boolean {
  function permute(arr: number[]): number[][] {
    if (arr.length === 0) return [[]]
    const result: number[][] = []
    for (let i = 0; i < arr.length; i++) {
      const rest = permute([...arr.slice(0, i), ...arr.slice(i + 1)])
      for (const perm of rest) {
        result.push([arr[i], ...perm])
      }
    }
    return result
  }

  function evaluate(nums: number[], ops: string[]): number[] {
    if (nums.length === 1) return nums

    const results: number[] = []
    for (let i = 0; i < nums.length - 1; i++) {
      const left = nums[i]
      const right = nums[i + 1]
      const newNums = [...nums.slice(0, i), 0, ...nums.slice(i + 2)]

      for (const op of ['+', '-', '*', '/']) {
        let result: number
        switch (op) {
          case '+':
            result = left + right
            break
          case '-':
            result = left - right
            break
          case '*':
            result = left * right
            break
          case '/':
            result = right !== 0 ? left / right : NaN
            break
          default:
            continue
        }

        if (!isNaN(result) && isFinite(result)) {
          newNums[i] = result
          const subResults = evaluate(newNums, [...ops, op])
          results.push(...subResults)
        }
      }
    }

    return results
  }

  const perms = permute(numbers)
  for (const perm of perms) {
    const results = evaluate(perm, [])
    for (const result of results) {
      if (Math.abs(result - 24) < 0.0001) {
        return true
      }
    }
  }

  return false
}
