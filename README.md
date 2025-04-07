<!-- Improved compatibility of back to top link: See: https://github.com/microsoft/TypeScript/pull/73 -->
<a name="readme-top"></a>
[![LinkedIn][linkedin-shield]][linkedin-url]


This project was born out of a proof of concept to see whether a single core language, Typescript in this instance, could be used across the 3 core full-stack layers, ie UX, API, Data. It is technical all feasible if using MongoDB or any of the Javascript NOSQL DBs. If it proved all ok, it was intended as  a Rapid Application Development Framework Template with all the good principles and patterns and core functionality such as authentication, authorisation, emailing, testing, inapp notifications, ci/cd, apis, workers,  localisation/globalisation, and more; already done, with me just adding more pages, endpoints, and code services to achieve more specialised business functionalities. In essense a  starter block for building more specialised bespoke web and cross-platform mobile Applications. It is also a show of how design patterns can DRASTICALLY cut sown the amount of code needed to do certain things. Take a look at the Notification System, and how inifinitely extensible it is, for me to add more notifiers like Facebook messenger, twitter dm, etc, using a strategy pattern and though the Open and Closed principle of SOLID. Object orientation is used exclusively as well (a feature that React sadly does not support fully, and which has lead to anti-patterns such as Hooks. The use of <strong>SWR Hooks</strong> was brillant for me though in decode_web)  
<br/>
<strong>Note:</strong> 
<p>
I am discarding this framework despite my belief that Loopback and NextJS are not well-suited for enterprise applications, as both frameworks come with significant challenges. Loopback and NextJS frequently experience breaking updates, and Loopback’s lack of support for compound primary keys is a major drawback. This limitation hinders the ability to normalize tables beyond 3NF into 4th Normal Form (4NF) and 5th Normal Form (5NF), which can critically impact performance tuning options for large datasets. 
Additionally, while Typescript facilitates unified development across APIs, websites and native mobile apps—spanning the UX layer (React/NextJS) and the API layer (Loopback)—the same benefits can be achieved within the more secure, mature, and robust .NET ecosystem. Leveraging Blazor (C#) and MAUI (C#), developers gain the advantage of a cohesive and powerful solution. The .NET ecosystem also provides better AI libraries, Tooling and integration. 
<strong>Loopback when used with TYpescript has excellect features</strong>
</p>

<!-- ABOUT THE PROJECT -->
(Drafting) Comprehensive API documentation covering all endpoints, parameters, and response formats.
>**Swagger Endpoint**: Easily explore and test API endpoints using the interactive Swagger interface.

>**TypeDoc Reference**: Detailed on-line documentation generated using TypeDoc, providing insights into all classes, functions, interfaces, and other objects utilized throughout the API.

Dive in and start building amazing things with this API! If you have any questions or encounter issues, feel free to [reach out](mailto:davidezechukwu@hotmail.com?subject=Report%20a%20bug&body=Details:%0A%0AExtra%20information:%0A)  
#### [Explore the technical documentation](https://decodeonline.app/api/docs/modules.html)
<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With:-
* [![Typescript][Typescript.js]][Typescript-url]
* [![Typescript][Typescript.js]][Typescript-url]
* [![Loopback][Loopback.js]][Loopback-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Supports the following databases:-
* [![SQLServer][SQLServer]][SQLServer-url]
* [![Postgres][Postgres]][Postgres-url]
* [![MongoDB Badge][MongoDB]][MongoDB-url]
<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Getting Started
A database is required. You can create this using the attached T-SQL(possible ANSI SQL compartible and hence POSTGRES compartible) scripts, or you run a npm run migrate command on the command line; on it's first run it will create the database objects and seed the taxonomy tables,<strong>a database is required though and must be created first, together with the user logon specified on the .env file as neither the scripts nor npm run migration do this<strong>. 
Loopback does not provide an Up and Down migration features unline .NET Entity Framework however third party libraries could be used for this
<br/>
If running locally in Windows and in development mode, you will need:-   
- Docker `If a docker-based database, Redis server and worker processes are required`
- A Redis server `A WSL2 Ubuntu Redis server would do`
- Nodejs `version >= 20.9.0`		
- NPM `version >= 7.24.2`
- PowerShell with `'Set-ExecutionPolicy RemoteSigned' applied`
- Port forwarding enabling in Windows by running `'.\api\src\_infrastructure\docker\os\windows\set-up-port-forwarding-for-wsl2.ps1'`
- An updated hosts file is needed to be updated with the entries in `'.\api\src\_infrastructure\docker\os\windows\hosts.txt'`
<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Road map
- [x] SCRUM Project
- [x] Public Website
- [x] Administrative Website
- [ ] Android Native Application
- [ ] IOS Native Application
- [x] Multi-language Support
    - [x] English
    - [x] French
    - [x] Punjabi
    - [ ] Spanish
    - [ ] German
- [x] Email and SMS communication
- [x] Documentation
- [x] Azure Continuous Deployment and Integration 
<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Bugs
[Report bug](mailto:davidezechukwu@hotmail.com?subject=Report%20a%20bug&body=Url:%0ADetails:%0A%0ABrowser:%0A%0AOS:%0AExtra%20information:%0A)  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Request a feature
[Request a feature](mailto:davidezechukwu@hotmail.com?subject=Report%20a%20bug&body=Details:%0A%0AExtra%20information:%0A)  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Live demo of the API and web client
You can try the API [demo here](https://decodelocal.com/api/explorer/), and you can try the [web client here](https://decodeonline.app/).  
You will need to authenticate on the web client in order to access the API endpoints that require authentication.
<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Reference
[Explore the technical documentation](https://decodeonline.app/api/docs/modules.html)
<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Contacts
- Name: David Ezechukwu
- Email Address: mailto:davidezechukwu@hotmail.com
<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
<!-- 
[contributors-shield]: https://img.shields.io/github/contributors/microsoft/TypeScript.svg?style=for-the-badge
[contributors-url]: https://github.com/microsoft/TypeScript/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/microsoft/TypeScript.svg?style=for-the-badge
[forks-url]: https://github.com/microsoft/TypeScript/network/members
[stars-shield]: https://img.shields.io/github/stars/microsoft/TypeScript.svg?style=for-the-badge
[stars-url]: https://github.com/microsoft/TypeScript/stargazers
[issues-shield]: https://img.shields.io/github/issues/microsoft/TypeScript.svg?style=for-the-badge
[issues-url]: https://github.com/microsoft/TypeScript/issues
[license-shield]: https://img.shields.io/github/license/microsoft/TypeScript.svg?style=for-the-badge
[license-url]: https://github.com/microsoft/TypeScript/blob/master/LICENSE.txt
 -->

[Typescript.js]: https://img.shields.io/badge/typescript.js-000000?style=for-the-badge&logo=typescriptdotjs&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/davidezechukwu
[product-screenshot]: ../images/big_logo.jpg
[Loopback.js]: https://img.shields.io/badge/loopback.js-000000?style=for-the-badge&logo=loopbackdotjs&logoColor=white
[Loopback-url]: https://loopback.io/
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[Sqlserver]: https://img.shields.io/badge/sqlserver-DD0031?style=for-the-badge&logo=sqlserver&logoColor=white
[Sqlserver-url]: https://www.microsoft.com/en-gb/sql-server/
[Postgres]: https://img.shields.io/badge/postgres-DD0031?style=for-the-badge&logo=postgres&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[MongoDB]: https://img.shields.io/badge/MongoDB-green?style=flat&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/
