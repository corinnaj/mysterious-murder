export const arrayEquals = (array1: any[], array2: any[]) => {
    return array1.length === array2.length && array1.every((value, index) => value === array2[index])
}