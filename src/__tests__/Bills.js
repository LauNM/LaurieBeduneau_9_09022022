/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {

            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            expect(windowIcon.classList).toContain("active-icon")

        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })
})

describe("Given I am connected as Employee, and I am on Bills page, and I clicked on a bill eye button", () => {
    test("handleClickIconEye method should have been called", async () => {
        // arrange
        Object.defineProperty(window, "localStorage", {value: localStorageMock});
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );
        const mock = jest.fn();
        jest
            .spyOn(Bills.prototype, "handleClickIconEye")
            .mockImplementationOnce(mock);
        document.body.innerHTML = "";
        document.body.innerHTML = BillsUI({data: bills});

        const eyes = screen.getAllByTestId("icon-eye");
        new Bills({
            document,
            onNavigate: jest.fn(),
            store: null,
            bills: bills,
            localStorage: window.localStorage,
        });
        // act
        fireEvent.click(eyes[0]);
        // assert
        expect(mock).toHaveBeenCalledTimes(1);
        expect(mock).toHaveBeenCalledWith(eyes[0]);
    });
    test("a modal should show up", async () => {
        // arrange
        Object.defineProperty(window, "localStorage", {value: localStorageMock});
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );
        document.body.innerHTML = "";
        document.body.innerHTML = BillsUI({data: bills});
        const eyes = screen.getAllByTestId("icon-eye");
        expect(eyes.length).toBe(4);
        $.fn.modal = jest.fn();
        const billContainer = new Bills({
            document,
            onNavigate: jest.fn(),
            store: null,
            bills: bills,
            localStorage: window.localStorage,
        });
        // act
        billContainer.handleClickIconEye(eyes[0]);
        // assert
        expect($().modal).toHaveBeenCalledWith("show");

    });
});

describe("Given I am connected as Employee, and I am on Bills page, and I click on newBill button", () => {
    test("handleClickNewBill method should have been called", async () => {
        // arrange
        Object.defineProperty(window, "localStorage", {value: localStorageMock});
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );
        const mock = jest.fn();
        jest
            .spyOn(Bills.prototype, "handleClickNewBill")
            .mockImplementationOnce(mock);
        document.body.innerHTML = "";
        document.body.innerHTML = BillsUI({data: bills});

        const newBillBtn = screen.getByTestId("btn-new-bill");
        new Bills({
            document,
            onNavigate: jest.fn(),
            store: null,
            bills: bills,
            localStorage: window.localStorage,
        });
        // act
        fireEvent.click(newBillBtn);
        // assert
        expect(mock).toHaveBeenCalledTimes(1);
    });
    test('It should renders NewBill page', async () => {
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bills({
            document,
            onNavigate,
            store: null,
            bills: bills,
            localStorage: window.localStorage,
        });
        const handleClick = jest.fn(bill.handleClickNewBill);
        handleClick()
        expect(screen.getByText(/Envoyer une note de frais/i)).toBeTruthy()
    })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
        test("fetches bills from mock API GET", async () => {
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "test@test.com",
                })
            );
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByText(/Mes notes de frais/))

            const contentPending  = screen.getAllByText("En attente")
            expect(contentPending).toBeTruthy()
            expect(contentPending.length).toBe(1)
            const contentRefused  = screen.getAllByText("Refused")
            expect(contentRefused).toBeTruthy()
            expect(contentRefused.length).toBe(2)

            const contentAccepted  = screen.getAllByText("Accepté")
            expect(contentAccepted).toBeTruthy()
            expect(contentAccepted.length).toBe(1)
        })
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                jest.spyOn(mockStore, "bills")
                Object.defineProperty(
                    window,
                    'localStorage',
                    { value: localStorageMock }
                )
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: "a@a"
                }))
                const root = document.createElement("div")
                root.setAttribute("id", "root")
                document.body.appendChild(root)
                router()
            })
            test("fetches bills from an API and fails with 404 message error", async () => {

                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list : () =>  {
                            return Promise.reject(new Error("Erreur 404"))
                        }
                    }})
                window.onNavigate(ROUTES_PATH.Bills)
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/)
                expect(message).toBeTruthy()
            })

            test("fetches messages from an API and fails with 500 message error", async () => {

                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list : () =>  {
                            return Promise.reject(new Error("Erreur 500"))
                        }
                    }})

                window.onNavigate(ROUTES_PATH.Bills)
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
            })
        })
    })
})
