/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom";
import {localStorageMock} from "../__mocks__/localStorage.js";
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
        })
        describe("When an error occurs", () => {
            test("create new bill and catch error", async () => {
                document.body.innerHTML = "";
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });

                const mockConsoleErr = jest.fn();
                Object.defineProperty(window, "console", {
                    value: {
                        error: mockConsoleErr
                    },
                });
                jest.spyOn(mockStore, "bills")
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        create: () => {
                            return Promise.reject(new Error('error'))
                        }
                    }
                })


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
                expect(console.error).toHaveBeenCalledTimes(1)
                expect(console.error).toEqual(mockConsoleErr)

            });
        })
        describe("When I submit form", () => {
            test("handleSubmit method should have been called", async () => {
                // arrange
                const mock = jest.fn();
                const spy1 = jest
                    .spyOn(NewBill.prototype, "handleSubmit")
                    .mockImplementationOnce(mock);

                document.body.innerHTML = "";
                document.body.innerHTML = NewBillUI();
                const form = screen.getByTestId("form-new-bill");
                new NewBill({
                    document,
                    onNavigate: jest.fn(),
                    store: null,
                    file: jest.fn(),
                    fileUrl: jest.fn(),
                    fileName: jest.fn(),
                    localStorage: window.localStorage,
                });
                // act
                fireEvent.submit(form);
                // assert
                expect(mock).toHaveBeenCalledTimes(1);
                spy1.mockRestore();
            });
            test("updateBill method should have been called", async () => {
                const mock = jest.fn();

                jest
                    .spyOn(NewBill.prototype, "updateBill")
                    .mockImplementationOnce(mock);
                Object.defineProperty(window, "localStorage", {value: localStorageMock});
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                        email: "employee@test.com"
                    })
                );

                document.body.innerHTML = "";
                document.body.innerHTML = NewBillUI();


                await waitFor(() => screen.getByText(/Envoyer une note de frais/));

                const form = screen.getByTestId("form-new-bill");
                screen.getByTestId("expense-type").value = "Transports"
                screen.getByTestId("expense-name").value = "Train Nantes-Montpellier"
                screen.getByTestId("datepicker").value = "2022-03-01"
                screen.getByTestId("amount").value = "110"
                screen.getByTestId("vat").value = "70"
                screen.getByTestId("pct").value = "20"
                screen.getByTestId("commentary").value = ""


                const newBill = new NewBill({
                    document,
                    onNavigate: () => {
                    },
                    store: null,
                    localStorage: window.localStorage,
                });

                newBill.fileName = 'test.png'
                newBill.fileUrl = 'https://test.com/test.png'

                fireEvent.submit(form)

                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith({
                    "amount": 110,
                    "commentary": "",
                    "date": "2022-03-01",
                    "email": "employee@test.com",
                    "fileName": "test.png",
                    "fileUrl": "https://test.com/test.png",
                    "name": "Train Nantes-Montpellier",
                    "pct": 20,
                    "status": "pending",
                    "type": "Transports",
                    "vat": "70",
                });

            })
        })

    })
})

