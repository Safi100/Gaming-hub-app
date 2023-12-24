import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import PageLoading from '../../../components/loading/PageLoading';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import Axios from 'axios'
import { AuthContext } from '../../../context/AuthContext';
import NotAuthorize from '../../../components/redirecting/NotAuthorize';
import './editGame.css'

const EditGame = () => {
    const authContext = useContext(AuthContext)
    const notify = () => {
        toast("Game Updated successfully!", {
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

    const {id} = useParams()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [gameTitle, setGameTitle] = useState('')
    // State variable for input values
    const [mainPhoto, setMainPhoto] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        genres: '',
        platforms: '',
        releaseDate: '',
        about_this_game: '',
        // min
        min_os: '',
        min_processor: '',
        min_memory: '',
        min_graphics_card: '',
        // max
        max_os: '',
        max_processor: '',
        max_memory: '',
        max_graphics_card: '',
        // photos
        main_photo: '',
        cover_photo: ''
    });

    // fetch the game data 
    useEffect(() => {
        Axios.get(`http://localhost:8000/api/game/fetch-game-to-edit/${id}`)
        .then(res => {
            setLoading(false);
            setGameTitle(res.data.title);
            setFormData({
                title: res.data.title,
                genres: res.data.genres,
                platforms: res.data.platforms,
                releaseDate: res.data.release_date,
                about_this_game: res.data.description,
                // Minimum Requirements
                min_os: res.data.systemRequirements[0].os,
                min_processor: res.data.systemRequirements[0].processor,
                min_memory: res.data.systemRequirements[0].memory,
                min_graphics_card: res.data.systemRequirements[0].graphics,
                // Recommended Requirements
                max_os: res.data.systemRequirements[1].os,
                max_processor: res.data.systemRequirements[1].processor,
                max_memory: res.data.systemRequirements[1].memory,
                max_graphics_card: res.data.systemRequirements[1].graphics,
                // photos
                main_photo: res.data.main_photo.url,
                cover_photo: res.data.cover_photo.url
            })
        })
        .catch(err => {
            setError(err.response.data)
            setLoading(false);
            console.log(err)
        })
    }, [id, authContext.currentUser])
    // input change event
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value.trimStart()
        });
    };
    // images change event
    const handleMainImageChange = (e) => {
        setMainPhoto(e.target.files[0])
    };
    const handleCoverImageChange = (e) => {
        setCoverPhoto(e.target.files[0])
    };
 
    // submit form
    const handleSubmit = (event) => {
      const form = event.currentTarget;
      event.preventDefault();
      if (form.checkValidity() === false) {
        event.stopPropagation();
      }else{
        // submit the data
        setUpdateLoading(true);
        let Data = new FormData()
        Data.append('title', formData.title)
        Data.append('platforms', formData.platforms)
        Data.append('releaseDate', formData.releaseDate)
        Data.append('genres', formData.genres)
        Data.append('about_this_game', formData.about_this_game)
        Data.append('min_os', formData.min_os)
        Data.append('min_processor', formData.min_processor)
        Data.append('min_memory', formData.min_memory)
        Data.append('min_graphics_card', formData.min_graphics_card)
        Data.append('max_os', formData.max_os)
        Data.append('max_processor', formData.max_processor)
        Data.append('max_memory', formData.max_memory)
        Data.append('max_graphics_card', formData.max_graphics_card)
        Data.append('mainPhoto', mainPhoto)
        Data.append('coverPhoto', coverPhoto)
        // Data.append('coverPhoto', coverPhoto)
        Axios.put(`http://localhost:8000/api/game/${id}`, Data)
        .then(res => {
          setGameTitle(res.data.title);
          setUpdateLoading(false)
          event.target.reset()
          notify()
          // display new images if there's
          if(res.data.main_photo) formData.main_photo = res.data.main_photo.url
          if(res.data.cover_photo) formData.cover_photo = res.data.cover_photo.url
          
        })
        .catch(err => {
          setUpdateLoading(false)
          console.log(err)
        })
      }
      setValidated(true);
    };
  
    return (
      loading ? <PageLoading /> :
      (!authContext.currentUser || !authContext.currentUser.isAdmin) ? <NotAuthorize /> :
      <>
      <ToastContainer/>
      <div className="wrapper">
        {error ? <h2 className='text-danger my-5 fs-1'>{error}</h2> :
      <Form className='editGameForm text-white' noValidate validated={validated} onSubmit={handleSubmit} encType="multipart/form-data">
        <h2 className='mb-12'>Edit {gameTitle}</h2>
        <Row className="mb-3 row-gap-3">
          <Form.Group as={Col} md="6" controlId="validationCustom01">
            <Form.Label>TITLE</Form.Label>
            <Form.Control name="title" value={formData.title} onChange={handleInputChange} required type="text" placeholder='Game title like Rocket League...' />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Please provide a game title.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="validationCustom02">
            <Form.Label>GENRES</Form.Label>
            <Form.Control name="genres" value={formData.genres} onChange={handleInputChange} required type="text" placeholder="Action, Adventure, RPG..." />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Please provide a game genre.</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="validationCustom03">
            <Form.Label>PLATFORMS</Form.Label>
            <Form.Control name="platforms" value={formData.platforms} onChange={handleInputChange} required type="text" placeholder="PC, PlayStation 5, PlayStation 4, Nintendo Switch, Xbox One..." />
            <Form.Control.Feedback type="invalid">Please provide a game platform.</Form.Control.Feedback>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="validationCustom04">
            <Form.Label>RELEASE DATE</Form.Label>
            <Form.Control name="releaseDate" value={formData.releaseDate} onChange={handleInputChange} required type="text" placeholder="Example: 23 Apr, 2019" />
            <Form.Control.Feedback type="invalid">Please provide a Release Date.</Form.Control.Feedback>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <div>
            <h3>If you don't want to update Images leave it</h3>
            <div className="images">
                <div className='main'>
                    <span>Main photo</span>
                    <img src={formData.main_photo} alt="Main_photo" />
                </div>
                <div className='cover'>
                    <span>Cover photo</span>
                <img  src={formData.cover_photo} alt="Cover_photo" />
                </div>
            </div>
            </div>
          <Form.Group as={Col} md="6" controlId="validationCustom05">
            <Form.Label>MAIN PHOTO</Form.Label>
            <Form.Control onChange={handleMainImageChange} name='mainPhoto' type="file" accept="image/*" />
            <Form.Control.Feedback type="invalid">Please provide a Main Photo.</Form.Control.Feedback>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="validationCustom06">
            <Form.Label>COVER PHOTO</Form.Label>
            <Form.Control onChange={handleCoverImageChange} name='coverPhoto' type="file" accept="image/*" />
            <Form.Control.Feedback type="invalid">Please provide a Cover photo.</Form.Control.Feedback>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="12" controlId="validationCustom07">
            <Form.Label>ABOUT THIS GAME</Form.Label>
            <Form.Control name="about_this_game" onChange={handleInputChange} value={formData.about_this_game} rows={7} as="textarea" required placeholder='Provide a description about this game...' />
            <Form.Control.Feedback type="invalid">Please provide a game description.</Form.Control.Feedback>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        {/* System Requirements */}
        <Row className="mb-3 mt-5">
            <Col md="6">
                <h2 className='fs-4 mb-4'>Minimum Requirements</h2>
                <Form.Group as={Col} className='mb-3' md="12" controlId="validationCustom08">
                    <Form.Label>OPERATING SYSTEM (OS)</Form.Label>
                    <Form.Control name="min_os" value={formData.min_os} onChange={handleInputChange} required type="text" placeholder='Example: 64-bit Windows 7 / Windows 10' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide an OS.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12" className='mb-3' controlId="validationCustom10">
                    <Form.Label>PROCESSOR</Form.Label>
                    <Form.Control name="min_processor" value={formData.min_processor} onChange={handleInputChange} required type="text" placeholder='Example: Intel Core i5-750, 2.66 GHz / AMD Phenom II X4 965, 3.4 GHz or AMD Ryzen™ 3 1200, 3.1 GHz' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a proccessor.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12" className='mb-3' controlId="validationCustom12">
                    <Form.Label>MEMORY</Form.Label>
                    <Form.Control name="min_memory" value={formData.min_memory} onChange={handleInputChange} required type="text" placeholder='Example: 8 GB RAM' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a memory size.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12" className='mb-3' controlId="validationCustom14">
                    <Form.Label>GRAPHICS CARD</Form.Label>
                    <Form.Control name="min_graphics_card" value={formData.min_graphics_card} onChange={handleInputChange} required type="text" placeholder='Example: NVIDIA® GeForce™ GTX 670 or NVIDIA® GeForce™ GTX 1050 / AMD® Radeon™ HD 7950 or AMD® Radeon™ R9 270' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a graphic card.</Form.Control.Feedback>
                </Form.Group>
            </Col>
            <Col md="6">
                <h2 className='fs-4 mb-4'>Recommended Requirements</h2>
                <Form.Group as={Col} md="12" className='mb-3' controlId="validationCustom09">
                    <Form.Label>OPERATING SYSTEM (OS)</Form.Label>
                    <Form.Control name="max_os" value={formData.max_os} onChange={handleInputChange} required type="text" placeholder='Example: 64-bit Windows 7 / Windows 10' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide an OS.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12" className='mb-3' controlId="validationCustom11">
                    <Form.Label>PROCESSOR</Form.Label>
                    <Form.Control name="max_processor" value={formData.max_processor} onChange={handleInputChange} required type="text" placeholder='Example: Intel Core i5-2300, 2.8 GHz / AMD FX-6300, 3.5GHz or AMD Ryzen™ 5 1400, 3.2 GHz' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a proccessor.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12" className='mb-3' controlId="validationCustom13">
                    <Form.Label>MEMORY</Form.Label>
                    <Form.Control name="max_memory" value={formData.max_memory} onChange={handleInputChange} required type="text" placeholder='Example: 16 GB RAM' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a memory size.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="12" className='mb-3' controlId="validationCustom15">
                    <Form.Label>GRAPHICS CARD</Form.Label>
                    <Form.Control name="max_graphics_card" value={formData.max_graphics_card} onChange={handleInputChange} required type="text" placeholder='Example: NVIDIA® GeForce™ GTX 780 or NVIDIA® GeForce™ GTX 1060-6GB / AMD® Radeon™ R9 290 or RX 570' />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">Please provide a graphic card.</Form.Control.Feedback>
                </Form.Group>
 
            </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Check required label="Agree before submission" feedback="You must agree before submitting." feedbackType="invalid" />
        </Form.Group>
        <Button type="submit" className='btn-warning' disabled={updateLoading} >
          {updateLoading === false ? 'Edit Game' : <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className=""> Loading...</span>
        </> }
        </Button>
      </Form>
      }
      </div>
      </>
    );
  }
export default EditGame;