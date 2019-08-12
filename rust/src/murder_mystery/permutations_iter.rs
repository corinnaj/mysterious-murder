
struct PermutationsIterator<T>
{
    pool: Vec<T>,
    indices: Vec<usize>,
    cycles: Vec<usize>,
    result: Option<Vec<T>>,
    r: usize,
    stopped: bool,
}
impl<T> PermutationsIterator<T> {
    fn new<I>(list: I, r: usize) -> PermutationsIterator<T>
        where I: Iterator<Item = T>
    {
        let pool: Vec<T> = list.collect();
        let n = pool.len();
        PermutationsIterator {
            pool: pool,
            r: r,
            indices: (0..n).collect(),
            cycles: (0..r).map(|i| n - i).collect(),
            stopped: r > n,
            result: None,
        }
    }
}
impl<T> Iterator for PermutationsIterator<T>
    where T: Copy
{
    type Item = Vec<T>;

    fn next(&mut self) -> Option<Vec<T>> {
        if self.stopped {
            return None;
        }

        match &mut self.result {
            None => {
                let mut result: Vec<T> = Vec::with_capacity(self.r);
                for i in 0..self.r {
                    result.push(self.pool[self.indices[i]]);
                }
                let res = Some(result.clone());
                self.result = Some(result);
                res
            }
            Some(previous_result) => {
                let n = self.pool.len();
                for i in (0..self.r).rev() {
                    println!("{:?} {}", self.cycles, i);
                    self.cycles[i] -= 1;
                    if self.cycles[i] == 0 {
                        let index = self.indices[i];
                        for j in i..(n-1) {
                            self.indices[j] = self.indices[j + 1];
                        }
                        self.indices[n - 1] = index;
                        self.cycles[i] = n - i;
                    } else {
                        let j = self.cycles[i];
                        let index = self.indices[i];
                        self.indices[i] = self.indices[n - j];
                        self.indices[n - j] = index;

                        for k in i..self.r {
                            let index = self.indices[k];
                            let elem = self.pool[index];
                            previous_result[k] = elem;
                        }
                        break;
                    }

                    if i == 0 {
                        self.stopped = true;
                        return None;
                    }
                }
                self.result.clone()
            }
        }
    }
}

trait Permutations<T> : Iterator<Item = T> + Sized
{
    fn permutations(self, size: usize) -> PermutationsIterator<T>;
}
impl<I, T> Permutations<T> for I
    where I: Iterator<Item = T>
{
    fn permutations(self, size: usize) -> PermutationsIterator<T>
        where I: Iterator
    {
        PermutationsIterator::new(self, size)
    }
}

