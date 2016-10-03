export default function init(pkg, done) {
    setTimeout(() => {
        pkg.options('test.async', true);
        done();
    }, 10);
}
