import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import PageLoading from '../../../components/loading/PageLoading';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../../../context/AuthContext';
import NotAuthorize from '../../../components/redirecting/NotAuthorize';
import Axios from 'axios'

const EditGiveaway = () => {
    const {id} = useParams();
    const authContext = useContext(AuthContext);
    const [games, setGames] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingLoading ,setAddingLoading] = useState(false);
    const [validated, setValidated] = useState(false);

    // State variable for input values
    const [formData, setFormData] = useState({
        heading: '',
        body: '',
        game: '',
        max_participants: '',
        winner_announcement_date: '',
    })

    // notify
    const notify = () => {
        toast("Giveaway updated successfully!", {
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
    // fetch giveaway data
    useEffect(() => {
        Axios.get(`http://localhost:8000/api/giveaway/${id}`)
        .then(res => {
            setLoading(false)
            setFormData({
                heading: res.data.heading,
                body: res.data.body,
                max_participants: Number(res.data.max_participants),
                game: res.data.game._id,
                winner_announcement_date: res.data.winner_announcement_date
            })
        })
        .catch(err => {
            console.log(err)
            setLoading(false)
            setError(err.response.data)
        })
    }, [id])

    // fetch games category
    useEffect(() => {
        Axios.get('http://localhost:8000/api/game/fetch-games-category')
        .then(res => setGames(res.data))
        .catch(err => console.log(err))
    }, [])

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
            Axios.put(`http://localhost:8000/api/giveaway/${id}`, formData)
            .then((res) => {
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

    // Assuming formData.winner_announcement_date is in the format "yyyy-MM-ddTHH:mm:ss.000Z"
    const originalDate = new Date(formData.winner_announcement_date);
    const year = originalDate.getUTCFullYear();
    const month = String(originalDate.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(originalDate.getUTCDate()).padStart(2, '0');
    // Formatted date as "yyyy-MM-dd"
    const formattedDate = `${year}-${month}-${day}`;

    return (
        loading ? <PageLoading /> :
        (!authContext.currentUser || !authContext.currentUser.isAdmin) ? <NotAuthorize /> :
        <>
        <ToastContainer/>
        <Form className='text-white wrapper py-3' noValidate validated={validated} onSubmit={handleSubmit} encType="multipart/form-data">
            <h2 className='mb-12'>Edit Giveaway</h2>
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
                    <Form.Control name="winner_announcement_date" value={formattedDate} onChange={handleInputChange} required type="date" />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a valid date.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="6" controlId="validationCustom03">
                    <Form.Label>Game Category</Form.Label>
                    <Form.Select onChange={handleInputChange} name='game' required value={formData.game}>
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
            {error && <p className='text-danger mb-3' dangerouslySetInnerHTML={{ __html: error.replace(/\n/g, '<br>')}} /> }
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

export default EditGiveaway;
