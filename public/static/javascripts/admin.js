const router = new Router({
    container: '#root',
    routes: {
        signin: SignInScreen,
        admin: AdminScreen
    },
    initial: 'signin'
});


function SignInScreen() {
    const auth = firebase.auth();
    const handleAuthStateChanged = auth.onAuthStateChanged((user) => {
        if (user && user.email === 'admin@gdgcebu.org') {
            router.navigate('admin');
        }
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        auth.signInWithEmailAndPassword(email, password);
    };

    this.template = 'template#signin-screen';

    this.ready = function() {
        this.signInForm = $('form');
        this.signInForm.addEventListener('submit', handleSubmit);
    };

    this.destroy = function() {
        this.signInForm.removeEventListener('submit', handleSubmit);
        handleAuthStateChanged();
    };
}


function AdminScreen() {
    const database = firebase.database();

    function resetForm() {
        $('form').question.value = '';
        $('#choices').innerHTML = '';
        for (let i = 0; i < 2; i++) {
            insertChoice();
        }
    }
    function insertChoice() {
        const choiceTmpl = $('template#choice').innerHTML;
        const choice = element(choiceTmpl);
        $('#choices').appendChild(choice);
    }
    function handleSubmit(e) {
        e.preventDefault();
        const text = e.target.question.value;
        const choices = $$('#choices li').map((choice) => {
            const text = $('input[type="text"]', choice).value;
            const correct = $('input[type="radio"]', choice).checked;
            return { text, correct };
        });
        database.ref('questions').push({ text, choices }).then(resetForm);
    }
    function handleRefOnChildAdded(snapshot) {
        console.log(snapshot.val());
    }

    this.template = 'template#admin-screen';

    this.ready = function() {
        resetForm();
        $('button[type="button"]').addEventListener('click', insertChoice);
        $('form').addEventListener('submit', handleSubmit);
        database.ref('questions').on('child_added', handleRefOnChildAdded);
    };

    this.destroy = function() {
        $('button[type="button"]').removeEventListener('click', insertChoice);
        $('form').removeEventListener('submit', handleSubmit);
        database.ref('questions').off('child_added', handleRefOnChildAdded);
    };
}


function $(selector, context=document) {
    return context.querySelector(selector);
}

function $$(selector, context=document) {
    return Array.from(context.querySelectorAll(selector));
}

function element(template, stage) {
    stage = stage || document.createElement('div');
    stage.innerHTML = template;
    return stage.firstElementChild;
}
