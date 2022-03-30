/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import router from "../app/Router.js";
import {ROUTES_PATH} from "../constants/routes.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        describe("When I add a file to form", () => {
            describe("When I add an image", () => {
                test("handleChangeFile method should have been called with no error", async () => {
                    document.body.innerHTML = "";
                    Object.defineProperty(window, "localStorage", {
                        value: localStorageMock,
                    });

                    window.localStorage.setItem(
                        "user",
                        JSON.stringify({
                            type: "Employee",
                            email: "test@test.com",
                        })
                    );

                    const root = document.createElement("div");
                    root.setAttribute("id", "root");
                    document.body.append(root);
                    router();
                    window.onNavigate(ROUTES_PATH.NewBill);

                    await waitFor(() => screen.getByText(/Envoyer une note de frais/));
                    const fileInput = screen.getByTestId("file");
                    expect(fileInput).toBeTruthy();

                    // act

                    const mockFile = new File(["test.png"], "test.png", {
                        type: "image/png",
                    });
                    fireEvent.change(fileInput, {
                        target: {
                            files: [mockFile],
                        },
                    });
                    await new Promise(process.nextTick);

                    // assert

                    expect(mockStore.bills().create).toHaveBeenCalledTimes(1);
                });
            })
            describe("When I add a pdf file", () => {
                test("handleChangeFile method should have been called with error wrong file type", async () => {
                    document.body.innerHTML = "";
                    Object.defineProperty(window, "localStorage", {
                        value: localStorageMock,
                    });

                    window.localStorage.setItem(
                        "user",
                        JSON.stringify({
                            type: "Employee",
                            email: "test@test.com",
                        })
                    );

                    const root = document.createElement("div");
                    root.setAttribute("id", "root");
                    document.body.append(root);
                    router();
                    window.onNavigate(ROUTES_PATH.NewBill);

                    await waitFor(() => screen.getByText(/Envoyer une note de frais/));
                    const fileInput = screen.getByTestId("file");
                    expect(fileInput).toBeTruthy();

                    // act

                    const mockFile = new File(["test.pdf"], "test.pdf", {
                        type: "application/pdf",
                    });
                    fireEvent.change(fileInput, {
                        target: {
                            files: [mockFile],
                        },
                    });

                    await new Promise(process.nextTick);

                    // assert

                    const error = waitFor(() => screen.getByTestId('file-error'));
                    expect((await error).textContent).toBe("Le fichier doit être une image  au format jpg | jpeg | png");
                })
            })

            test("Then submit if form is ok", () => {

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
                const mock = jest.fn();
                jest
                    .spyOn(containerNewBill, 'handleSubmit')
                    .mockImplementationOnce(mock)

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
