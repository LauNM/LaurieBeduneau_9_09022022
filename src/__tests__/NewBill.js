/**
 * @jest-environment jsdom
 */

import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I add a file to form", () => {
      test("Then submit if form is ok", () => {

      /*  Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
            })
        );
        const mock = jest.fn();
        jest
            .spyOn(NewBill.prototype, "handleSubmit")
            .mockImplementationOnce(mock);
        document.body.innerHTML = "";
        document.body.innerHTML = NewBillUI()

        const file = new File(['hello'], 'hello.png', {type: 'image/png'})

        const createdBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: null,
          localStorage: window.localStorage
        });

       // const handleSubmit = jest.spyOn(createdBill, 'handleSubmit')
        const form = screen.getByTestId("form-new-bill")
        //const handleChangeFile = jest.fn((e) => createdBill.handleChangeFile(e));
        const inputFile = screen.getByTestId('file');
        fireEvent.change(inputFile, file)
        //inputFile.addEventListener('change', handleChangeFile);
       // userEvent.upload(inputFile, file)
        screen.getByTestId("expense-type").value = "Transports"
        screen.getByTestId("expense-name").value = "Vol paris nice"
        screen.getByTestId("datepicker").value = "2021-05-25"
        screen.getByTestId("amount").value = "300"
        screen.getByTestId("vat").value = "20"
        screen.getByTestId("pct").value = "20"
        screen.getByTestId("commentary").value = "class eco"
        //form.addEventListener('submit', handleSubmit);
        fireEvent.submit(form)
        expect(mock).toHaveBeenCalled()
      })*/
        window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
            })
        );
      document.body.innerHTML = NewBillUI()
      const containerNewBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage,
      })
      /*const mock = jest.fn();
      jest
          .spyOn(containerNewBill, 'handleSubmit')
          .mockImplementationOnce(mock)*/

      const handleSubmit = jest.spyOn(containerNewBill, 'handleSubmit')

      const form = screen.getByTestId("form-new-bill")
      screen.getByTestId("expense-type").value = "Transports"
      screen.getByTestId("expense-name").value = "Train Paris-Marseille"
      screen.getByTestId("datepicker").value = "2022-01-15"
      screen.getByTestId("amount").value = "80"
      screen.getByTestId("vat").value = "70"
      screen.getByTestId("pct").value = "20"
      screen.getByTestId("commentary").value = "Seconde classe"
      //containerNewBill.fileName = 'test.png'
      //containerNewBill.fileUrl = 'https://test.com/test.png'

      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)
        //expect(mock).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalled()
      //expect(screen.getByText(/mes notes de frais/i)).toBeTruthy()
    })
    })
  })
})
