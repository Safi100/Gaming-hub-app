import { useState, useEffect, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContext';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import Spinner from 'react-bootstrap/Spinner';
import Axios from 'axios'
import NotAuthorize from '../../../components/redirecting/NotAuthorize';

const NewGiveAway = () => {
    const authContext = useContext(AuthContext);
    const [games, setGames] = useState([]);
    const [error, setError] = useState('');
    const [addingLoading ,setAddingLoading] = useState(false);
    
    // fetch games category
    useEffect(() => {
        Axios.get('http://localhost:8000/api/game/fetch-games-category')
        .then(res => setGames(res.data))
        .catch(err => console.log(err))
    }, [])

    const notify = () => {
        toast("Giveaway Added successfully!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
          });
      }
    const [validated, setValidated] = useState(false);
    // State variable for input values
    const [formData, setFormData] = useState({
        heading: '',
        body: '',
        game: '',
        max_participants: '',
        winner_announcement_date: '',
    })

   // input change event
   const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value.trimStart()
        });
    };

    const handleSubmit = (e) => {
        const form = e.currentTarget;
        e.preventDefault();
        if (form.checkValidity() === false) {
          e.stopPropagation();
        }else{
            setAddingLoading(true)
            setError('')
            // submit the data
            Axios.post('http://localhost:8000/api/giveaway', formData)
            .then((res) => {
                e.target.reset()
                setFormData({
                    heading: "",
                    body: "",
                    winner_announcement_date: "",
                    max_participants: "",
                    game: ""                    
                })
                notify()
                setValidated(false)
                setAddingLoading(false)
            })
            .catch(err => {
                setAddingLoading(false)
                setError(err.response.data)
                console.log(err)
            })
        }
        setValidated(true);
    }
    return ( 
        (!authContext.currentUser || !authContext.currentUser.isAdmin) ? <NotAuthorize /> :
        <>
        <ToastContainer/>
        <Form className='text-white wrapper py-3' noValidate validated={validated} onSubmit={handleSubmit} encType="multipart/form-data">
            <h2 className='mb-12'>Add New Give Away</h2>
            <Row className="mb-3 row-gap-3">
                <Form.Group as={Col} md="6" controlId="validationCustom01">
                    <Form.Label>Heading</Form.Label>
                    <Form.Control name="heading" value={formData.heading} onChange={handleInputChange} required type="text" placeholder='Example: RUST STEAM KEY - GLOBAL...' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a heading text.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Label>Maximum participants</Form.Label>
                    <Form.Control name="max_participants" min={1} value={formData.max_participants} onChange={handleInputChange} required type="number" />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a maximum participants, Greater than or 1.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="6" controlId="validationCustom03">
                    <Form.Label>Winner announcement date</Form.Label>
                    <Form.Control name="winner_announcement_date" value={formData.winner_announcement_date} onChange={handleInputChange} required type="date" />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a valid date.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="6" controlId="validationCustom03">
                    <Form.Label>Game Category</Form.Label>
                    <Form.Select onChange={handleInputChange} name='game' required>
                        <option value="">Choose a game category</option>
                        {games.map(game => (
                            <option value={game._id} key={game._id}>{game.title}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a game category.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12" controlId="validationCustom04">
                    <Form.Label>Body (optional)</Form.Label>
                    <Form.Control name="body" onChange={handleInputChange} value={formData.body} rows={7} as="textarea" placeholder='Provide a description about this giveaway...' />
                </Form.Group>
            </Row>
            {error && <p className='text-danger mb-3'>{error}</p>}
            <Button type="submit" className='btn-success' disabled={addingLoading} >
            {addingLoading === false ? 'Add Giveaway' : 
            <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                <span> Loading...</span>
            </> 
            }
            </Button>
        </Form>
        </>
    );
}

export default NewGiveAway;