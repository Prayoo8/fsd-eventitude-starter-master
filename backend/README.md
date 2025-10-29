# Eventitude Starter Code

**For the full-stack web development assignment 25/26**

Steps to download and run:
1. Make sure you have NodeJS installed on your machine ([Download NodeJS](https://nodejs.org/en/download/))
2. Make sure you have Git installed on your machine ([Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)/[Mirror Download for Windows Version](https://gitlab.com/jei/se-software-pool/-/tree/main/Git%202.45.2))
2. In your terminal, navigate to the directory where you want to download the project
3. Run `git clone https://gitlab.com/jei/fsd-eventitude-starter`
4. Once the project has finished downloading, navigate into the projects root directory `cd fsd-eventitude-server`
5. Run `npm install` to install all dependencies for the project
6. Once the dependencies have installed, run the server using `npm run dev`. You will see a message saying that the server is running on port 3333.
7. In a **separate terminal window** navigate to the projects root directory and run `npm run test` to run the tests. The tests will mostly fail, but that is because we have not yet written any code.

Once you have completed the above, you are set up and ready to begin work on the assignment.

**Things to remember:**
1. To re-run the tests, you can first wipe the DB by running `npm run wipe`. The tests assume a fresh database each time.
2. The tests may have mistakes too, check your work manually (using Postman). If you're not sure, ask.
3. The API documentation is located on Swagger [here](https://app.swaggerhub.com/apis/XCUI/eventitude-api/1.0.0)

If you have any issues, come see me in the labs.

Xia