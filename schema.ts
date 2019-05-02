interface Api {
    sub(
        a: Int32, 
        b: Bool, 
        c: String, 
        d: Array<Int32>, 
        f: { a: Int32 },
    ): Promise<Int32>;
}
