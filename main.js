//Comprobar si todo funciona correctamente
console.log('Funciona_');





//Fubcion para abrir puertas de intro
document.getElementById("entrar").addEventListener("click", () => {
  
  const intro = document.getElementById("intro");

  intro.classList.add("abrir");

  setTimeout(() => {
    intro.style.display = "none";
  }, 1200);

});








//Importar la biblioteca de Three.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

//Importar el módulo de controles de órbita para movilizar el objeto
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module';


//Importar el módulo de carga de modelos GLTF para cargar modelos 3D
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js?module';





//Crear la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);  

 scene.background = null; 

 



//Crear la cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  10000
);


//Posición inicial escritorio
camera.position.set(0, 3, 2);

//Responsividad
//Si es celular, alejar más
if(window.innerWidth < 768){
  camera.position.set(0, 6, 5);
}


//Crear herramienta de raycasting para detectar clics en los puntos de interés
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();



//Variable global para almacenar el punto de interés seleccionado
let puntoActivo = null;

//Variable global para almacenar el punto de interés al que se le hizo hover y cambiar su estado visual al mover en la escena
let puntoHover = null;

//Variables globales para almacenar la posición objetivo de la cámara y controles al hacer clic en un punto de interés, para luego volver a la vista inicial
let cameraTargetPosition = null;
let controlsTargetPosition = null;



let animandoCamara = false;


//Crear un grupo para los puntos de interés
const puntos = new THREE.Group();




  //Crear el renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



//Agregar controles de órbita para movilizar el objeto
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2;



// 👉 punto al que mira la cámara
controls.target.set(0, 0, 0);



//LUZ (IMPORTANTE para modelos 3D)
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const light2 = new THREE.DirectionalLight(0xffffff, 1);
light2.position.set(5, 10, 5);
scene.add(light2);


//HELPER (pivotes para orientarte)
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);





//CARGAR MODELO 3D

let modelo; // variable global para el modelo 3D

const loader = new GLTFLoader();


loader.load(
  './assets/mapa.glb',
  (gltf) => {
    
    modelo = gltf.scene;

     //* 🔹 DEBUG: forzar material visible
modelo.traverse((child) => {
  if (child.isMesh) {

    const textura = child.material.map;

    child.material = new THREE.MeshStandardMaterial({
      map: textura,
      side: THREE.DoubleSide
    });

    if (textura) {
      textura.colorSpace = THREE.SRGBColorSpace;
      textura.anisotropy =
        renderer.capabilities.getMaxAnisotropy();
    }
  }
});

    
// 🔹 calcular tamaño y centro
    const box = new THREE.Box3().setFromObject(modelo);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    console.log('Tamaño:', size);
    console.log('Centro:', center);




    // 🔹 centrar modelo

     modelo.position.x += 0;
     modelo.position.z += 0;

  // 🔹 bajar al suelo
     modelo.position.y += 0;




    // 🔹 escalar automáticamente
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    modelo.scale.setScalar(scale);


    // 🔹 helper para ver límites
    const boxHelper = new THREE.BoxHelper(modelo, 0xffff00);
    scene.add(boxHelper);

    scene.add(modelo);

    //Crear un grupo para los puntos de interés con respecto al modelo
    modelo.add(puntos);

    // 👉 actualizar controles después de cargar
    controls.update();

    console.log('Modelo cargado ✅');
  },
  undefined,
  (error) => {
    console.error('Error cargando modelo ❌', error);
  }
);








//ANIMACIÓN
function animate() {
  requestAnimationFrame(animate);

  controls.update();

//Animación para escalar suavemente los puntos de interés al hacer hover y volver a su tamaño original al quitar el hover, con respecto al modelo 3D
puntos.children.forEach((punto) => {

  const escalaActual = punto.scale.x;

  const escalaObjetivo = punto.userData.targetScale;

  const nuevaEscala = THREE.MathUtils.lerp(
    escalaActual,
    escalaObjetivo,
    0.1
  );

  punto.scale.set(
    nuevaEscala,
    nuevaEscala,
    nuevaEscala
  );

});

//Animación para mover suavemente la cámara y controles al hacer clic en un punto de interés y volver a la vista inicial, con respecto al modelo 3D
if (animandoCamara && cameraTargetPosition && controlsTargetPosition) {

  camera.position.lerp(cameraTargetPosition, 0.08);
  controls.target.lerp(controlsTargetPosition, 0.08);

  // detener cuando llegue cerca
  if (
    camera.position.distanceTo(cameraTargetPosition) < 0.01 &&
    controls.target.distanceTo(controlsTargetPosition) < 0.01
  ) {
    animandoCamara = false;
  }
}


  renderer.render(scene, camera);

  
}

animate();









function crearPunto(x, y, z, color, nombre, direccion, categoria, descripcion, importancia, imagen, mapsLink) 
{

  //Crear geometría y material para el punto de interés y ajustar escala
  const geometry = new THREE.SphereGeometry(0.003, 32, 32);

  const material = new THREE.MeshStandardMaterial({

  color: color,
  emissive: color,
  emissiveIntensity: 1,
  metalness: 0.2,
  roughness: 0.3
});


  const punto = new THREE.Mesh(geometry, material);

  punto.position.set(x, y, z);



punto.userData = {

  targetScale: 1,
  nombre: nombre,
  direccion: direccion,
  categoria: categoria,
  descripcion: descripcion,
  importancia: importancia,
  imagen: imagen,
  mapsLink: mapsLink,
  colorOriginal: color,
  tipoColor: color
};


  puntos.add(punto);

  return punto;
}


//Crear puntos de interés en el mapa con diferentes colores para cada tipo de lugar
//Y ajustar posicion x,y,z manualmente

    //Categoria 1: Historia e identidad (Cafe)

//1
crearPunto(-0.060, 0.047, 0.025, 0xffff00,  'Lugar:	Cabildo Indígena Muisca de Bosa',
  'Direccion: Carrera 87B # 71 Bis - 05 Sur, (Bosa San Bernardino)',  'Categoria: Historia e identidad', 
  'Descripcion: Espacio de gobierno y reunión de la comunidad indígena originaria de Bosa.',
  'Importancia: : Es el corazón de la resistencia cultural. Representa el reconocimiento legal de los descendientes directos de los muiscas que habitaban el territorio antes de la llegada de los españoles.',
  './assets/img/CABILDO INDIGENA MUISCA DE BOSA (SAN BERNARDINO).jpg', 
  'https://maps.app.goo.gl/Ki64tkdRfqtjth4Y9');

//2
  crearPunto(0.008, 0.047, 0.067, 0xffff00,  'Lugar: Parque Fundacional de Bosa',
  'Direccion: Carrera 80H con Calle 61 Sur, (Bosa Centro)',  'Categoria: Historia e identidad', 
  'Descripcion: EEs el centro geográfico y social donde convergen la vida administrativa y la memoria del antiguo pueblo de Bosa.',
  'Importancia: Es uno de los pocos trazados coloniales que sobreviven en Bogotá. Aquí se dio el histórico encuentro en 1539 entre los conquistadores Gonzalo Jiménez de Quesada, Sebastián de Belalcázar y Nicolás de Federmán para resolver disputas territoriales.',
  './assets/img/PLAZA FUNDACIONAL DE BOSA (BOSA CENTRO).jpg', 
  'https://maps.app.goo.gl/nc6FsKAckCNyc4pW8');

//3

  crearPunto(0.022, 0.047, 0.095, 0xffff00,  'Lugar: Casa del Tren de Bosa',
  'Direccion: Carrera 77g #63 Sur 25, (Bosa La estacion)',  'Categoria: Historia e identidad.', 
  'Descripcion: Antigua infraestructura ligada al Ferrocarril de la Sabana hasta 1945',
  'Importancia: Testigo del pasado industrial y de transporte de la localidad; recuerda la época en que Bosa era un municipio independiente conectado por rieles con el centro de Bogotá.',
  './assets/img/CASA DEL TREN (BOSA LA ESTACION).jpg',
  'https://maps.google.com/?q=Casa+del+Tren+Bosa');


    //Categoria 2: Territorio y ambiente (Verde):

//1  
  crearPunto(-0.057, 0.047, 0.080, 0x00ff88,  'Lugar: Humedal Tibanica de Bosa',
  'Direccion: Diagonal 73F sur #78G, (Bosa Alameda), https://maps.app.goo.gl/AniAgxvotLExn6Yd7',  'Categoria: Territorio y ambiente.', 
  'Descripcion: Parque Ecológico Distrital de Humedal (PEDH) con alto potencial de avistamiento de aves y biodiversidad (más de 60 especies de flora).',
  'Importancia: Es el pulmón hídrico de la zona, parte de la subcuenca del río Tunjuelo, vital para el control de inundaciones y conservación de especies. Posee la máxima certificación ambiental internacional RAMSAR.',
  './assets/img/HUMEDAL TIBANICA (ALAMEDA).jpg',
  'https://maps.app.goo.gl/jza5LrzaecKsq2nB6');

  


    //Categoria 3: Instituciones y servicios (Azul):

//1
  crearPunto(0.007, 0.047, 0.059, 0x00aaff,  'Lugar: Alcaldía Local de Bosa',
  'Direccion: Carrera 80 # 61 - 05 Sur, (Bosa Centro)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Sede del gobierno local y despacho del Alcalde o Alcaldesa Local.',
  'Importancia: Es el centro de mando de la localidad. Aquí se gestionan los recursos del Fondo de Desarrollo Local, se ejecutan las obras públicas de los barrios y se coordina la convivencia ciudadana. Además, es el espacio donde se realizan las audiencias públicas y se atiende a la comunidad para resolver sus necesidades.',
  './assets/img/ALCALDIA BOSA (BOSA CENTRO).jpg', 
  'https://maps.app.goo.gl/Xiurhkhc98RFFGKD7');


//2 
  crearPunto(0.028, 0.047, 0.070, 0x00aaff,  'Lugar: Personería',
  'Direccion: Calle 62 Sur # 80H - 12, (Bosa Centro)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Organismo de control que vigila la conducta de los funcionarios públicos y protege los derechos de los ciudadanos.',
  'Importancia: Es el defensor del pueblo a nivel local. Su labor es vital para asegurar que las instituciones cumplan su deber y no se vulneren los derechos humanos de los bosunos.',
  './assets/img/PERSONERIA  (BOSA CENTRO).png',
   'https://maps.app.goo.gl/r1bW4iQaAeA6GPNT6');


//2
  crearPunto(0.019, 0.047, 0.065, 0x00aaff,  'Lugar: DILE (Dirección Local de Educación) de Bosa', 
  'Direccion: Carrera 80H # 61 - 05 Sur (Bosa Centro).',  'Categoria: Participación comunitaria', 
  'Descripcion: Oficina técnica de la Secretaría de Educación que supervisa los colegios oficiales y privados de la localidad.',
  'Importancia: Es el punto clave para la comunidad en temas de cupos escolares, traslados y certificaciones. Su papel es vital para garantizar el derecho a la educación de los niños y jóvenes de Bosa, facilitando trámites que antes requerían ir hasta el nivel central de la ciudad.',
  './assets/img/DALE (DIRECCION LOCAL DE EDUCACION) (BOSA CENTRO).jpg', 
'https://maps.app.goo.gl/KPQzA18KsRJDWvCL7');





//3
  crearPunto(0.077, 0.047, 0.098, 0x00aaff,  'Lugar: SuperCADE Bosa',
  'Avenida Calle 57 R Sur # 72D - 12, (UPZ APOGEO)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Centro de atención masiva donde se concentran múltiples entidades públicas y privadas (servicios públicos, impuestos, movilidad, etc.).',
  'Importancia: Facilita la vida del ciudadano al permitir realizar cientos de trámites en un solo lugar, evitando desplazamientos largos hasta el centro de Bogotá.',
  './assets/img/SUPERCADE (APOGEO).jpg', 
  'https://maps.app.goo.gl/yK1eCb93fuAgjGCMA');

//4
  crearPunto(-0.080, 0.049, -0.040, 0x00aaff,  'Lugar: Hospital de Bosa (II Nivel)',
  'Direccion: Calle 65 Sur # 80 Bis - 56, (Bosa Recreo)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Principal centro de atención médica de la localidad de segundo nivel que brinda servicios de urgencias, hospitalización y consulta externa..',
  'Importancia: Es el eje del sistema de salud local. Su infraestructura es fundamental para atender la alta demanda médica de una de las localidades más pobladas de la ciudad.',
  './assets/img/HOSPITAL DE BOSA (BOSA RECREO).png', 
'https://maps.app.goo.gl/2bEkzxjF3A8MVStc6');


//5
  crearPunto(-0.038, 0.047, 0.080, 0x00aaff,  'Lugar: Registraduría Local',
  'Direccion: Calle 62 Sur # 80H - 51, (Bosa Centro)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Oficina encargada del registro civil (nacimientos, matrimonios) y la expedición de cédulas y tarjetas de identidad.',
  'Importancia: Garantiza el derecho a la identidad y la participación democrática de todos los habitantes de la zona.',
  './assets/img/REGISTRADURIA (PIAMONTE).png',
'https://maps.app.goo.gl/PvQmKfsJqQXvV2BQ9');

  //6
  crearPunto(0.002, 0.047, 0.063, 0x00aaff,  'Lugar: Notaría 73 de Bosa',
  'Direccion: Calle 65 Sur # 80 - 08, (Bosa Centro)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Oficina que otorga fe pública a documentos privados (escrituras, testamentos, registros).',
  'Importancia: Brinda seguridad jurídica a los ciudadanos en sus negocios, trámites de propiedad y actos civiles, validando legalmente sus acuerdos.',
  './assets/img/NOTARIA (BOSA CENTRO).png',
'https://maps.app.goo.gl/VxBRmZkXLfJ8CVVu8');

  //7
  crearPunto(-0.042, 0.047, 0.050, 0x00aaff,  'Lugar: Integración Social',
  'Direccion: Carrera 80K # 61 - 28 Sur, (Bosa Laureles)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Entidad encargada de ejecutar las políticas para las poblaciones más vulnerables (niñez, adultos mayores, habitantes de calle).',
  'Importancia: Es la mano social de la alcaldía; gestiona comedores comunitarios, jardines infantiles y apoyos económicos para quienes más lo necesitan.',
  './assets/img/SUBDIRECCIÓN LOCAL DE INTEGRACIÓN SOCIAL (BOSA LAURELES).jpg',
'https://www.google.com/maps/place/Subdirecci%C3%B3n+Local+Para+La+Integraci%C3%B3n+Social+Bosa/@4.6112822,-74.1970964,17z/data=!3m1!4b1!4m6!3m5!1s0x8e3f9e150a7541ab:0x7e3171366b19832a!8m2!3d4.6112822!4d-74.1970964!16s%2Fg%2F11bycgcbq_?entry=tts&g_ep=EgoyMDI2MDUwMi4wIPu8ASoASAFQAw%3D%3D');

  //8
  crearPunto(-0.010, 0.047, 0.073, 0x00aaff,  'Lugar: ICBF',
  'Direccion: Carrera 81 # 64 - 15 Sur, (Bosa Centro)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Sede del Instituto Colombiano de Bienestar Familiar encargada de la protección integral de la primera infancia, niñez y adolescencia.',
  'Importancia: Es la entidad clave para la restitución de derechos cuando hay casos de maltrato o abandono infantil, asegurando el bienestar del futuro de la localidad.',
  './assets/img/ICBF (BOSA CENTRO).jpg', 
'https://maps.app.goo.gl/Exi9p9MUxwcrBjUF7');

  //9
  crearPunto(-0.002, 0.047, 0.084, 0x00aaff,  'Lugar: Estación de Policía Tequendama de Bosa',
  'Direccion: Calle 65 Sur # 77G - 02, (Bosa La Amistad)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Unidad de comando de la Policía Metropolitana de Bogotá para el territorio de Bosa.',
  'Importancia: Encargada de mantener el orden público, la seguridad en los barrios y la atención inmediata a emergencias de criminalidad o convivencia.',
  './assets/img/ESTACION DE POLICIA TEQUENDAMA (BOSA LA AMISTAD).png',
'https://maps.app.goo.gl/Exi9p9MUxwcrBjUF7');


  //10
  crearPunto(-0.010, 0.047, 0.056, 0x00aaff,  'Lugar: Bomberos Bosa',
  'Direccion: 80I # 61 - 05 Sur, (Bosa Centro)',  'Categoria: Instituciones y servicios.', 
  'Descripcion: Cuerpo oficial de socorro especializado en la extinción de incendios, rescates y manejo de materiales peligrosos.',
  'Importancia: Su presencia es crítica para la gestión de riesgos, especialmente en zonas cercanas a industrias o áreas con riesgo de inundación por el río Tunjuelo.',
  './assets/img/ESTACION BOMBEROS (BOSA CENTRO).jpg',
'https://maps.app.goo.gl/4gnzbsBUFpQb513c6');




    //Categoria 4: Participación comunitaria (Morado):

    //1 

  crearPunto(-0.025, 0.047, 0.077, 0xff00ff,  'Lugar: CREA Bosa', 
  'Direccion: Calle 68 Sur No. 78h - 37 (Bosa San Pablo)',  'Categoria: Participación comunitaria', 
  'Descripcion: Espacio del IDARTES donde se dictan talleres gratuitos de danza, teatro, artes plásticas, literatura y música.',
  'Importancia: Democratiza la cultura. Permite que niños y adultos que no pueden pagar una academia privada tengan formación artística de alta calidad, convirtiendo el arte en una herramienta de transformación social.',
  './assets/img/CREA (BOSA SAN PABLO).png', 
'https://maps.app.goo.gl/1Uuav5N3jwm1xrm3A');


  //2
  crearPunto(-0.005, 0.049, -0.075, 0xff00ff,  'Lugar: CDC (Centro de Desarrollo Comunitario) El Porvenir', 
  'Direccion: Carrera 94 Bis # 54 Sur-10, (Bosa Porvenir).',  'Categoria: Participación comunitaria', 
  'Descripcion: Un complejo que ofrece servicios de formación técnica, cursos de artes y oficios, y espacios recreativos para personas de todas las edades.',
  'Importancia: Actúa como un puente hacia el empleo y el emprendimiento. Ayuda a reconstruir el tejido social al ofrecer capacitación gratuita que mejora los ingresos y la calidad de vida de las familias más vulnerables.',
  './assets/img/CDC (CENTRO DE DESARROLLO COMUNITARIO) (BOSA PORVENIR).png', 
'https://maps.app.goo.gl/a6SKPwxY74ViBsGq5');

  // 3
  crearPunto(-0.070, 0.047, -0.030, 0xff00ff,  'Lugar: Biblioteca Pública de Bosa (CC Metro Recreo)', 
  'Direccion: Carrera 97C # 69A - 08 Sur (CC Metro Recreo, Nivel 5).',  'Categoria: Participación comunitaria', 
  'Descripcion: Espacios de lectura, acceso a Internet y talleres culturales que pertenecen a la red BibloRed.',
  'Importancia: Son centros de conocimiento abiertos a todos. La biblioteca de Bosa es famosa por su "Huerta Bibliotecaria" y sus clubes de lectura, que promueven el pensamiento crítico y el intercambio de saberes ancestrales y modernos.',
  './assets/img/BIBLIOTECA PUBLICA DE BOSA (METRO RECREO).jpg', 
'https://maps.app.goo.gl/BqyQChbin4JaTfQe7');

  // 4

   crearPunto(-0.027, 0.047, 0.047, 0xff00ff,  'Lugar: Casa de la Juventud José Saramago', 
  'Direccion: Cra. 82j 70A - 52 (Bosa Palestina).',  'Categoria: Participación comunitaria', 
  'Descripcion: Territorio joven con estudios de grabación, salas TIC, laboratorios de arte y asesoría jurídica/psicológica para personas entre 14 y 28 años.',
  'Importancia: Ofrece un refugio creativo y seguro para los jóvenes. Es vital para prevenir riesgos sociales y permitir que las nuevas generaciones expresen su talento en diferentes formas de arte.',
  './assets/img/CASA DE LA JUVENTUD JOSE SARAMAGO (BOSA PALESTINA).jpg',
'https://maps.app.goo.gl/g6DDRKa8Ec7DQmsE6');

  // 5

     crearPunto(-0.003, 0.047, 0.051, 0xff00ff,  'Lugar: Casa de la Participación', 
  'Direccion: Carrera 80K # 61 - 28 Sur (Bosa Centro).',  'Categoria: Participación comunitaria', 
  'Descripcion: Espacio físico dotado de auditorios y oficinas diseñado para el encuentro de organizaciones sociales, Juntas de Acción Comunal (JAC) y colectivos.',
  'Importancia: Es la sede operativa de la democracia local. Allí se coordinan los presupuestos participativos y se fortalecen las capacidades de liderazgo de los vecinos para que puedan incidir en las decisiones de la Alcaldía.',
  './assets/img/CASA DE LA PARTICIPACION (BOSA CENTRO).jpg', 
'https://maps.app.goo.gl/Wfw7GJRSi5FQoDE78');


  // 6

       crearPunto(0.017, 0.047, 0.090, 0xff00ff,  'Lugar: IDIPRON Bosa', 
  'Direccion: Carrera 81G # 73 Sur - 10 (Bosa La Estacion).',  'Categoria: Participación comunitaria', 
  'Descripcion: Centros de atención para niños, niñas, adolescentes y jóvenes en situación de vulnerabilidad o calle.',
  'Importancia: Salva vidas al ofrecer alimentación, apoyo pedagógico y formación a jóvenes en alto riesgo, dándoles una segunda oportunidad para reintegrarse con éxito a la sociedad y a su familia.',
  './assets/img/IDIPRON (Bosa La estacion) - copia.png', 
'https://maps.app.goo.gl/Af6q2HEFdLZdKkPF8');

  // 7

        crearPunto(-0.031, 0.047, 0.081, 0xff00ff,  'Lugar: Biblioteca Comunitaria', 
  'Direccion: Carrera 78C # 1a - 37 (Bosa Piamonte).',  'Categoria: Participación comunitaria', 
  'Descripcion: Es un espacio de gestión popular que ofrece servicios de préstamo de libros, capacitaciones con el SENA y acceso a internet. Cuenta con una colección de aproximadamente 5,000 tomos.',
  'Importancia: Es un ejemplo de autogestión vecinal. Su relevancia radica en llevar la cultura a sectores donde las bibliotecas públicas grandes quedan lejos, funcionando además como un centro de apoyo para personas con discapacidad y población vulnerable gracias a sus convenios locales.',
  './assets/img/BIBLIOTECA COMUNITARIA (PIAMONTE).png', 
'https://maps.app.goo.gl/cvtyw6GYECr86xGz6');

  // 8







//Detectar clics en los puntos de interés con respecto al modelo 3D usando raycasting
renderer.domElement.addEventListener('pointerdown', onMouseClick);




//Función para manejar clics en los puntos de interés
function onMouseClick(event) {
     // Calcular posición del mouse en coordenadas normalizadas (-1 a +1)  
     const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      camera.updateMatrixWorld();
  
      raycaster.setFromCamera(mouse, camera);


    const intersects = raycaster.intersectObjects(puntos.children);

     if (intersects.length > 0) {

    
     //Hacer zoom a la posición del punto seleccionado con respecto al modelo 3D
     // Obtener el punto seleccionado y su posición en el mundo
    const puntoSeleccionado = intersects[0].object;


    //Variable global para almacenar el punto de interés seleccionado y cambiar su estado visual al mover en la escena
    puntoActivo = puntoSeleccionado;

    const posicionMundo = new THREE.Vector3();
    puntoSeleccionado.getWorldPosition(posicionMundo);

//Calcular posición objetivo para la cámara y controles con respecto al modelo 3D
   cameraTargetPosition = new THREE.Vector3(
   posicionMundo.x + 0.0,
   posicionMundo.y + 0.3,
   posicionMundo.z + 0.2
    );

   controlsTargetPosition = posicionMundo.clone();

   animandoCamara = true;


   
    console.log('Seleccionaste:', puntoSeleccionado.userData.nombre);


    // Mostrar panel de información con datos del punto seleccionado
    document.getElementById('tituloLugar').textContent =
    puntoSeleccionado.userData.nombre;

    document.getElementById('direccion').textContent =
    puntoSeleccionado.userData.direccion;
    

    document.getElementById('descripcionLugar').textContent =
    puntoSeleccionado.userData.descripcion;

    document.getElementById('categoriaLugar').textContent =
    puntoSeleccionado.userData.categoria;

    document.getElementById('importanciaLugar').textContent =
    puntoSeleccionado.userData.importancia;

    const imagen = document.getElementById('imagenLugar');
    imagen.src = puntoSeleccionado.userData.imagen;
     imagen.style.display = 'block';

     //Actualizar enlace de Google Maps con la ubicación del punto seleccionado
const btnMaps = document.getElementById('btnMaps');
btnMaps.href = puntoSeleccionado.userData.mapsLink;

    

//ocultar Boton para volver a la vista inicial 
document.getElementById('btnVolver').style.display = 'block';

document.getElementById('panelInfo')
.classList.add('activo');



    puntoSeleccionado.material.emissiveIntensity = 2;

    setTimeout(() => {
      puntoSeleccionado.material.emissiveIntensity = 0.4;
    }, 500);



   
}

}

//Función para manejar hover en los puntos de interés y cambiar su estado visual al mover en la escena y escalar bola
renderer.domElement.addEventListener('pointermove', onMouseMove);

function onMouseMove(event){

  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(puntos.children);

  

  if(puntoHover){

  puntoHover.userData.targetScale = 1;

  puntoHover.material.emissiveIntensity = 1;

}

if(intersects.length > 0){

  puntoHover = intersects[0].object;

  puntoHover.userData.targetScale = 1.5;

  puntoHover.material.emissiveIntensity = 3;

} else {

  puntoHover = null;


}
}

//Función para volver a la vista inicial con boton 
document.getElementById('btnVolver').addEventListener('click', () => {


  //Posición inicial de la cámara y controles con respecto al modelo 3D
cameraTargetPosition = new THREE.Vector3(0, 3, 2);
controlsTargetPosition = new THREE.Vector3(0, 0, 0);


animandoCamara = true;



  //ocultar botón
  document.getElementById('btnVolver').style.display = 'none';

  //ocultar panel lateral
  document.getElementById('panelInfo')
  .classList.remove('activo');

  //limpiar punto activo
  puntoActivo = null;

});




//Función para mover el punto seleccionado con las flechas del teclado y saber ubicacion de puntos para despues cambiar en main.js viendo parametros en consola
window.addEventListener('keydown', (event) => {

  if (!puntoActivo) return;

  const paso = 0.01;

  switch(event.key){

    case 'ArrowUp':
      puntoActivo.position.z -= paso;
      break;

    case 'ArrowDown':
      puntoActivo.position.z += paso;
      break;

    case 'ArrowLeft':
      puntoActivo.position.x -= paso;
      break;

    case 'ArrowRight':
      puntoActivo.position.x += paso;
      break;

    case 'q':
      puntoActivo.position.y += paso;
      break;

    case 'e':
      puntoActivo.position.y -= paso;
      break;
  }

  console.log(
    puntoActivo.userData.nombre,
    puntoActivo.position.x.toFixed(3),
    puntoActivo.position.y.toFixed(3),
    puntoActivo.position.z.toFixed(3)
  );

});



//Función (condicionales) para filtrar puntos por categoría usando botones y cambiar su estado visual al mover en la escena
const categoriasHTML = document.querySelectorAll('.categoria');

categoriasHTML.forEach((categoriaHTML) => {

  categoriaHTML.addEventListener('click', () => {

    const texto = categoriaHTML.textContent;

    puntos.children.forEach((punto) => {

      if(texto.includes('Historia')){

        punto.visible =
          punto.userData.tipoColor === 0xffff00;

      }

      if(texto.includes('Territorio')){

        punto.visible =
          punto.userData.tipoColor === 0x00ff88;

      }

      if(texto.includes('Instituciones')){

        punto.visible =
          punto.userData.tipoColor === 0x00aaff;

      }

      if(texto.includes('Participación')){

        punto.visible =
          punto.userData.tipoColor === 0xff00ff;

      }
      if(texto.includes('Todas')){

        punto.visible = true;   

      }

    });

  });

});














//Responsividad three.js mapa seccion 1 (index.html)
window.addEventListener('resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

if(window.innerWidth < 768){
   camera.position.set(0, 6, 5);
}

});