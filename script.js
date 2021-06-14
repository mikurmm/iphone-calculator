$(function() {
  const stack = []

  // 途中結果を表示するための計算
  const calculateMiddleResult = () => {
    if (stack.length === 0) return 0
    if (stack.length === 1) return stack[0].value

    const lastOperator = stack[stack.length - 1].operator || stack[stack.length - 2]
    if (['×', '÷'].includes(lastOperator)) {
      const operators = stack.map(element => element.operator)
      const index = Math.max(operators.lastIndexOf('+'), operators.lastIndexOf('−'))
      if (index >= 0) {
        const calculatingStack = stack.slice(index + 1, stack.length)
        return calculateUnit(calculatingStack)
      }
    } else {
      return calculateResult()
    }
  }

  // 全結果の計算
  const calculateResult = () => {
    return divideUnits(stack).reduce((result, elements, index, dividedUnits) => {
      if (index === 0) return calculateUnit(elements)
      const beforeElements = dividedUnits[index - 1]
      const operator = beforeElements[beforeElements.length - 1].operator
      if (operator === '+') {
        result += calculateUnit(elements)
      } else if (operator === '−') {
        result -= calculateUnit(elements)
      }
      return result
    }, 0)
  }

  // かけ算・割り算でつながった項の計算
  const calculateUnit = (elements) => {
    if (elements.length === 1) return elements[0].value
    let result = elements[0].value
    for (let i = 1; i < elements.length; i++) {
      const operator = elements[i - 1].operator
      const value = elements[i].value
      if (operator === '×') {
        result *= value
      } else if (operator === '÷') {
        result /= value
      } else {
        alert('エラー！')
      }
    }
    return result
  }

  // かけ算・割り算でつながったものを一つの項にして、項ごとに分ける
  const divideUnits = (stack) => {
    return stack.reduce((result, element, index) => {
      if (result.length === 0) {
        result.push([element])
        return result
      }

      if (['+', '−'].includes(stack[index - 1].operator)) {
        result.push([element])
        return result
      }
      result[result.length - 1].push(element)
      return result
    }, [])
  }

  // ゼロ除算されてるかどうかのチェック
  const checkZeroDivide = () => {
    const length = stack.length
    if (length <= 1) return false
    return stack[length - 1].value === 0 && stack[length - 2].operator === '÷'
  }

  $('.button').click(function () {
    const lastElement = stack[stack.length - 1]
    const buttonText = $(this).text()
    const value = parseInt(buttonText) >= 0 ? parseInt(buttonText) : buttonText

    $('.operator').removeClass('focus')

    if ($(this).hasClass('clear')) {
      stack.splice(0)
      $('.screen').text(0)
      $('.clear').text('AC')
      return
    }

    if (!$(this).hasClass('number') && checkZeroDivide()) {
      stack.splice(0)
      $('.screen').text('エラー')
      return
    }

    if ($(this).hasClass('result')) {
      const result = calculateResult()
      stack.splice(0)
      stack.push({ value: result, operator: null })
      $('.screen').text(result)
      return
    }

    if ($(this).hasClass('number')) {
      $('.clear').text('C')

      if (!lastElement) {
        stack.push({ value, operator: null })
        $('.screen').text(value)
        return
      }
      if (!lastElement.operator) {
        const newElement = { value: lastElement.value * 10 + value, operator: null }
        stack.splice(stack.length - 1, 1, newElement)
        $('.screen').text(newElement.value)
        return
      }

      stack.push({ value, operator: null })
      $('.screen').text(value)
      return
    }

    if ($(this).hasClass('operator')) {
      $(this).addClass('focus')
      if (!lastElement) {
        stack.push({ value: 0, operator: value })
        return
      }
      stack.splice(stack.length - 1, 1, { value: lastElement.value, operator: value })
      $('.screen').text(calculateMiddleResult())
      return
    }
  })
})
