window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("f").addEventListener("submit", (e) => {
        fetch('/Sign-in').then((res) => {
            console.log(res);
            if (!(res.redirected)) {
                document.getElementById("false").style.display = "block";
            }
        }).catch((error) => {
            console.error('Error fetching users:', error);
            document.getElementById("false").style.display = "block";
        })
    })
})


